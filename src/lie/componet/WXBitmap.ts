module lie {

	// test
	const pfUtils = WXUtils.getInstance();

	/**
	 * 微信数据开放域控件
	 * 使用：设置好控件大小、坐标及类型即可，其它的无需管理
	 * 注：该控件跟开放域的代码是配套的，不同开放域代码请勿使用该类
	 */
	export class WXBitmap extends Laya.Sprite {

		private $viewName: string;
		private $texture: Laya.Texture;
		private $bitmap: any;
		private $timeout: number;
		private $timer: lie.Timer;

		public auto: boolean = true;	// 仅在未加入场景前修改有效，兼容ui

		constructor() {
			super();
			this.once(Laya.Event.DISPLAY, this, this.onCreate);
			this.once(Laya.Event.UNDISPLAY, this, this.onDestroy);
		}

		/**
		 * 加入场景
		 */
		protected onCreate(): void {
			var self = this;
			// 纹理
			var texture = self.$texture = pfUtils.getShareCanvas();
			var bitmap = self.$bitmap = texture.bitmap;
			self.graphics.drawTexture(texture);
			self.visible = false;
			self.$timer = new Timer(self.reloadCanvas, self, 5, false, true);
			self.auto && self.refresh();
		}

		/**
		 * 离开场景
		 */
		protected onDestroy(): void {
			var self = this;
			var post = pfUtils.postMessage;
			self.clear();
			post('exit', { view: self.$viewName });
			// post('pause');
		}

		/**
		 * 设置界面名称
		 */
		public set viewName(value: string) {
			this.$viewName = value;
		}

		/**
		 * 刷新开放域界面
		 * @param param 携带参数通知开放域
		 */
		public refresh(param?: any): void {
			var self = this;
			var width = self.width;
			var height = self.height;
			var data = {
				view: self.$viewName,
				width: width,
				height: height
			};
			// 赋值属性
			for (let i in param)
				data[i] = param[i];
			self.visible = true;
			// 检测
			var texture = self.$texture;
			if (texture) {
				let timer = self.$timer;
				// 通知+延迟刷新界面
				let post = pfUtils.postMessage;
				// post('resume');
				post('enter', data);
				// 5秒后停止绘画
				self.clearTimeout();
				self.reloadCanvas();	// 先刷新一次
				timer.start();
				self.$timeout = lie.setTimeout(timer.stop, timer, 5000);
			}
		}

		/**
		 * 重新渲染cavans界面
		 */
		protected reloadCanvas(): void {
			var bitmap = this.$bitmap;
			var func = bitmap._source && bitmap.reloadCanvasData;
			func && func.call(bitmap);
		}

		/**
		 * 清除延迟
		 */
		protected clearTimeout(): void {
			var self = this;
			lie.clearTimeout(self.$timeout);
			self.$timeout = null;
		}

		/**
		 * 清除界面
		 */
		protected clear(): void {
			var self = this;
			var texture = self.$texture;
			var timer = self.$timer;
			if (timer) {
				timer.clear();
				self.$timer = null;
			}
			if (texture) {
				texture.destroy(true);
				self.$texture = null;
				self.$bitmap = null;
			}
			self.clearTimeout();
			self.graphics.clear();
		}
	}
}