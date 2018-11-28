module lie {
	/**
	 * 监听对象
	 */
	type TargetEvent = laya.events.EventHandler;

	interface ScaleTarget extends Laya.Sprite {
		$hashBegin?: boolean;// 是否按下
		$bgScaleX?: number;	// 初始缩放值
		$bgScaleY?: number;
		$evtScale?: number;	// 缩放倍数
	}

	/**
	 * 控件监听工具类
	 */
	export class EventUtils {

		protected static $scaleTime: number = 100;	// 缩放动画时间

		/**
		 * 是否有该监听
		 * @param type 监听类型
		 * @param call 空时只检测类型
		 * @param thisObj 回调所属对象
		 */
		public static hasEventListener(target: Laya.EventDispatcher, type: string, call?: Function, thisObj?: any): boolean {
			var value = (<any>target)._events;
			var datas = value && value[type];
			if (datas && call) {
				if (datas instanceof laya.events.EventHandler)
					return datas.method == call && datas.caller == thisObj;
				// 数组
				for (let i in datas) {
					let event = <TargetEvent>datas[i];
					if (event.method == call && event.caller == thisObj)
						return true;
				}
			}
			// datas存在的情况下，call为空返回真
			return !!datas && !call;
		}

		/**
		 * 添加缩放监听，记得用removeEventListener来移除这个监听
		 */
		public static addScaleListener(target: ScaleTarget, scale: number = 0.95): void {
			var self = EventUtils;
			target.$evtScale = scale;
			target.$bgScaleX = target.scaleX;
			target.$bgScaleY = target.scaleY;
			self.addTouchBeginListener(target, self.onScaleBegin, self);
			self.addTouchFinishListener(target, self.onScaleEnd, self);
		}

		/**
		 * 缩放开始
		 */
		protected static onScaleBegin(event: Laya.Event): void {
			var target = <ScaleTarget>event.currentTarget;
			var tween = Tween;
			var scale = target.$evtScale;
			var scaleX = target.scaleX = target.$bgScaleX;
			var scaleY = target.scaleY = target.$bgScaleY;
			scaleX *= scale;
			scaleY *= scale;
			target.$hashBegin = true;
			tween.get(target).to({ scaleX: scaleX, scaleY: scaleY }, EventUtils.$scaleTime);
		}

		/**
		 * 缩放结束
		 */
		protected static onScaleEnd(event: Laya.Event): void {
			var target = <ScaleTarget>event.currentTarget;
			var time = EventUtils.$scaleTime;
			var scaleX = target.$bgScaleX;
			var scaleY = target.$bgScaleY;
			var bScaleX = scaleX * 1.1;
			var bScaleY = scaleY * 1.1;
			target.$hashBegin && Tween.get(target).to({ scaleX: bScaleX, scaleY: bScaleY }, time).
				to({ scaleX: scaleX, scaleY: scaleY }, time);
			target.$hashBegin = void 0;
		}

		// 常用的监听类型归类

		/**
		 * 添加点击按下监听
		 */
		public static addTouchBeginListener(target: Laya.EventDispatcher, call: Function, thisObj?: any): void {
			target.on(Laya.Event.MOUSE_DOWN, thisObj, call);
		}

		/**
		 * 添加点击移动监听
		 */
		public static addTouchMoveListener(target: Laya.EventDispatcher, call: Function, thisObj?: any): void {
			target.on(Laya.Event.MOUSE_MOVE, thisObj, call);
		}

		/**
		 * 添加点击谈起监听
		 */
		public static addTouchEndListener(target: Laya.EventDispatcher, call: Function, thisObj?: any): void {
			target.on(Laya.Event.MOUSE_UP, thisObj, call);
		}

		/**
		 * 添加click监听
		 */
		public static addClickListener(target: Laya.Sprite, call: Function, thisObj?: any, musicType: number = 0): void {
			EventUtils.addClickEffect(target, musicType);
			target.on(Laya.Event.CLICK, thisObj, call);
		}

		/**
		 * 在click的基础上进行缩放
		 */
		public static addClickScaleListener(target: ScaleTarget, call: Function, thisObj?: any, musicType?: number, scale?: number): void {
			var self = EventUtils;
			self.addScaleListener(target, scale);
			self.addClickListener(target, call, thisObj, musicType);
		}

		/**
		 * 添加监听结束监听
		 */
		public static addTouchFinishListener(target: Laya.EventDispatcher, finish: Function, thisObj?: any): void {
			var event = Laya.Event;
			target.on(Laya.Event.MOUSE_UP, thisObj, finish);
			target.on(Laya.Event.MOUSE_OUT, thisObj, finish);
		}

		/**
		 * 添加按住监听
		 * @param target
		 * @param begin 按住时的回调
		 * @param end 松手时的回调，会调用多次，请自己在end里判断
		 */
		public static addTouchingListener(target: Laya.EventDispatcher, begin: Function, end: Function, thisObj?: any): void {
			var self = EventUtils;
			self.addTouchBeginListener(target, begin, thisObj);
			self.addTouchFinishListener(target, end, thisObj);
		}

		/**
		 * 添加移动控件监听
		 * @param target 监听控件
		 * @param call 移动时的回调，回调参数有俩，横坐标的移动值和纵坐标的移动值
		 * @param thisObj 回调的所属对象
		 */
		public static addMovingListener(target: Laya.Sprite, call: (disX: number, disY: number) => void, thisObj?: any): void {
			var self = EventUtils;
			var touchX, touchY;
			self.addTouchBeginListener(target, function (e: Laya.Event) {
				e.stopPropagation();
				touchX = e.stageX;
				touchY = e.stageY;
			});
			self.addTouchMoveListener(target, function (e: Laya.Event) {
				e.stopPropagation();
				let newX = e.stageX, newY = e.stageY;
				call.call(thisObj, newX - touchX, newY - touchY);
				touchX = newX;
				touchY = newY;
			});
		}

		// 音效相关

		/**
		 * 类型说明：普通点击(修改了，原open)、关闭型按钮点击、领取型点击
		 */
		private static $musics: string[] = [/*'icon_close', 'icon_close', 'purchase'*/];

		/**
		 * 添加点击音效
		 */
		protected static addClickEffect(target: Laya.Sprite, type?: number): void {
			var self = EventUtils;
			var music = self.$musics[type];
			music && self.addTouchBeginListener(target, function () {
				// pfUtils.createEffect(music);
			}, null);
		}
	}
}