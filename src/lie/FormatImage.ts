module lie {

	/**
	 * 格式化位图
	 */
	export class FormatImage extends Laya.Image {

		private $format: string;
		private $value: string;

		/**
		 * 设置skin的通用格式，用%s或%d表示替换符号位置，只允许出现一次，如font_%s.png
		 */
		public set format(value: string) {
			this.$format = value;
			this.update();
		}

		/**
		 * 设置符号
		 */
		public set value(value: string) {
			this.$value = value;
			this.update();
		}

		/**
		 * 更新
		 */
		protected update(): void {
			var self = this;
			var format = self.$format;
			if (format) {
				let value = self.$value;
				if (value) {
					self.skin = Utils.formatString(format, value);
				}
			}
		}
	}
}