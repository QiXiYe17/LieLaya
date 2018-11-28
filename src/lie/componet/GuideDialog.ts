module lie {

	//// 说明：注释前带*的说明是要自己实现的功能、接口、函数等 ////

	/**
	 * 引导中控件的信息缓存：控件、控件旧数据、控件的父控件、位于父控件的下标
	 */
	type TValues = [Laya.Sprite, any[], Laya.Node, number];

	/**
	 * *引导配置，不够完善的话可继承该接口，需新增自己需要响应到界面的属性
	 */
	export interface IGuideConfig {
		later: boolean;	// 是否延迟响应（界面初始化未完成时）
	}

	/**
	 * 检测对象是否是数组
	 */
	var isArray = Array.isArray || function (obj: any): boolean {
		return Object.prototype.toString.call(obj) === '[object Array]';
	};

	/**
	 * 引导界面
	 * *注，继承可修改，如果继承Dialog的话要先初始化DialogManager，Laya的奇葩
	 */
	export class GuideView extends Laya.Sprite {

		private $config: IGuideConfig;	// 当前配置
		private $distance: number;		// 坐标偏差，默认适应宽度，即Y轴的坐标偏差
		/**
		 * 约束属性，即存放会影响一个控件坐标的属性数组
		 */
		private $attrs: string[] = ['x', 'y', 'left', 'right',
			'bottom', 'top', 'centerX', 'centerY'];
		/**
		 * 控件的信息缓存
		 */
		private $values: TValues[];

		protected constructor(config: IGuideConfig, displays: Laya.Sprite[]) {
			super();
			var stage = Laya.stage;
			var width = this.width = stage.width;
			var height = this.height = stage.height;
			this.$distance = height - 1334;	// 微信小游戏默认高度1334
			// *如果继承Dialog的话可取消
			var rect = new Laya.Sprite;
			var graphics = rect.graphics;
			graphics.setAlpha(.9);
			graphics.drawRect(0, 0, width, height, '#000000');
			this.addChild(rect);
			// 界面初始化完毕后执行高亮
			GuideView.$isSave = true;
			this.setConfig(config, displays);
		}

		/**
		 * 点击关闭引导
		 */
		protected onClick(e: Laya.Event): void {
			var self = this;
			// *e.stopPropagation(); // *按需要是否停止监听传递，默认引导的点击是最先触发的
			// 更新引导
			GuideView.$guide++;
			// *发送服务器更新
			// 界面
			self.recoveryConstrain();
			self.destroy(true);
			GuideView.$isSave = false;
		}

		/**
		 * 初始化点击控件的监听，保证引导的监听是最先触发
		 */
		protected initDisplayEvent(displays: Laya.Sprite[]): void {
			var self = this;
			var type = Laya.Event.CLICK;
			for (let i in displays) {
				let display = displays[i];
				let patcher = (<any>display)._events;	// 监听存放对象
				display.on(type, self, self.onClick);
				// 保证这次监听最前接受
				let array = <any[]>patcher[type];
				// 存在多个监听时为数组
				if (isArray(array))
					array.unshift(array.pop());
			}
		}

		/**
		 * 移除约束
		 */
		protected removeConstrain(displays: Laya.Sprite[]): void {
			var self = this;
			var length = displays.length;
			if (length > 0) {
				let attrs = self.$attrs;
				let points = [];
				let values = self.$values = <TValues[]>[];
				for (let i in displays) {
					let display = displays[i];
					let point = display.localToGlobal(new Laya.Point(0, 0)); // 先将当前世界坐标保存起来
					let value = values[i] = <any>[display] as TValues;
					let position = value[1] = [];
					points.push(point);
					for (let j in attrs) {
						let attr = attrs[j];
						position[j] = display[attr];
						display[attr] = NaN;
					}
					// 从原始父控件脱离
					let parent = value[2] = display.parent;
					value[3] = parent.getChildIndex(display);
					parent.removeChild(display);
					// 加入引导
					self.addChild(display);
					display.x = point.x;
					display.y = point.y;
					// ui控件
					if (display instanceof Laya.Component) {
						display.x += display.anchorX * display.width;
						display.y += display.anchorY * display.height;
					}
				}
			}
		}

		/**
		 * 恢复约束
		 */
		protected recoveryConstrain(): void {
			var self = this;
			var values = self.$values;
			if (values) {
				let attrs = self.$attrs;
				for (let i in values) {
					let value = values[i];
					let display = value[0];
					// 恢复坐标
					let position = value[1];
					for (let j in attrs) {
						display[attrs[j]] = position[j];
					}
					// 恢复父控件
					value[2].addChildAt(display, value[3]);
					// 删除监听
					display.off(Laya.Event.CLICK, self, self.onClick);
				}
				self.$values = null;
			}
		}

		/**
		 * 设置配置
		 * @param config 配置
		 * @param displays 高亮控件，必存在，但长度未知
		 */
		public setConfig(config: IGuideConfig, displays: Laya.Sprite[]): void {
			var self = this;
			// *按照配置初始化界面-请自行增加
			// 引导的通用功能
			if (config.later)
				Laya.timer.callLater(self, self.removeConstrain, displays);
			else
				self.removeConstrain(displays);
		}

		//// 引导的界面方法，不同游戏引导需要自己修改 ////

		private static $guide: number = 0;	// 看init函数
		private static $isSave: boolean;	// 是否打开了引导

		/**
		 * *初始化玩家引导数据
		 * @param guide 玩家的引导步骤
		 */
		public static init(guide: number): void {
			GuideView.$guide = guide;
		}

		/**
		 * *显示引导
		 * @param step 引导步骤
		 * @param displays 高亮的控件，当配置为1时只有点击该控件才会关闭窗口
		 */
		public static showGuide(step: number, ...displays: Laya.Sprite[]): void {
			// var self = GuideView;
			// var guide = self.$guide;
			// // var configs = <IGuideConfig[]>[]; 存放服务器配置的数组，请自行初始化，也可在init函数初始化
			// if (!self.$isSave && guide < configs.length) {
			// 	let config = configs[guide];
			// 	if (config.step == step) {
			// 		// 加入场景，改成
			// 		Laya.stage.addChild(new GuideView(config, displays));
			// 	}
			// }
			// Laya比较奇葩，继承Dialog的话要定义
			Laya.stage.addChild(new GuideView({ later: false }, displays));
		}
	}
}

/**
 * 引导配置信息
 */
interface ITFGuideConfig {
	type: number;		// 引导的界面类型
	text: string;		// 介绍文本
	textY: number;		// 文本坐标
	bottom?: boolean;	// 人物底部引导
	hand?: number;		// 手指，表示手指方向（0上1下）
	step?: number;		// （重）强制引导类型（同一个触发引导点step相同）
	unit?: number;		// （重）非强制引导单位（1、2、4、8..2^n）
	later?: boolean;	// 是否延迟响应
}