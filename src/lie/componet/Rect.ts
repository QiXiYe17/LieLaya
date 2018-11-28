module lie {

	/**
	 * 纯颜色的矩形，默认黑色
	 */
	export class Rect extends Laya.Sprite {

		private $once: any[];

		constructor(width: number = 0, height: number = 0, color: string = '#0') {
			super();
			var graphics = this.graphics;
			graphics.drawRect(0, 0, width, height, color);
			this.$once = [0, 0, width, height, color];
			this.width = width;
			this.height = height;
		}

		public destroy(dc?: boolean): void {
			super.destroy(dc);
			this.$once = null;
		}

		/**
		 * 设置颜色
		 */
		public set color(value: string) {
			var self = this;
			if (self.color != value) {
				self.$once[4] = value;
				self.update(true);
			}
		}

		/**
		 * 获取颜色
		 */
		public get color(): string {
			return this.$once[4];
		}

		/**
		 * 重写，监听宽高变化
		 */
		public repaint(): void {
			super.repaint();
			this.update();
		}

		/**
		 * 刷新
		 * @param isReset 强制刷新
		 */
		protected update(isReset?: boolean): void {
			var self = this;
			var once = self.$once;
			if (once) {
				var width = self.width, height = self.height;
				if (isReset || once[2] != width || once[3] != height) {
					once[2] = width;
					once[3] = height;
					// 重绘会影响repaint
					let graphics = self.graphics;
					graphics.clear();
					graphics.drawRect.apply(graphics, once);
				}
			}
		}
	}
}