module lie {

	/**
	 * *基础颜色默认大小，因游戏而异
	 */
	var colorBase = {
		'pic_number_y_': 104,
		'pic_number_w_': 44
	};
	/**
	 * 获取尺寸
	 * @param format 格式
	 */
	var getSize = function (format: string): number {
		let keys = Object.keys(colorBase);
		for (let i in keys) {
			let key = keys[i];
			if (format.indexOf(key) > -1)
				return colorBase[key];
		}
		return 30;
	};

	/**
	 * 位图文本
	 */
	export class BitmapLabel extends Laya.Component {

		private $format: string;
		private $text: string;
		private $fontSize: number;
		private $sScale: number = 1;
		private $bSzie: number = 30;		// 默认大小
		private $distance: number = 4;

		private $upCall: Function;
		private $upThis: any;

		/**
		 * 设置位图的通用格式，使用%s或%d取代替换符号的位置
		 * @example format = 'font_%s.png'
		 */
		public set format(value: string) {
			var self = this; Laya.Component
			if (value != self.$format) {
				self.$format = value;
				self.$bSzie = getSize(value);
				self.update();
				self.updateScale();
			}
		}

		/**
		 * 设置文本
		 */
		public set text(value: string) {
			var self = this;
			value = value == void 0 ? '' : String(value);
			if (value != self.$text) {
				self.$text = value;
				self.update();
			}
		}

		/**
		 * 获取文本
		 */
		public get text(): string {
			return this.$text;
		}

		/**
		 * 设置字体大小
		 */
		public set fontSize(value: number) {
			value = Number(value);
			if (!isNaN(value)) {
				let self = this;
				self.$fontSize = value;
				self.updateScale();
			}
		}

		/**
		 * 更新内容
		 */
		protected async update(): Promise<void> {
			var self = this;
			var format = self.$format;
			if (format) {
				let text = self.$text;
				let graphics = self.graphics;
				let width = 0, height = 0;
				if (text) {
					let turn = Utils.formatString, scale = self.$sScale, distance = self.$distance * scale, sx = 0,
						texs = <Laya.Texture[]>[];
					for (let i = 0, len = text.length; i < len; i++) {
						let url = turn(format, text[i]);
						let tet = <Laya.Texture>await RES.getAsyncRes(url);
						tet && texs.push(tet);
					}
					// 放这里有效减少闪屏时间
					graphics.clear();
					for (let i = 0, len = texs.length; i < len; i++) {
						let tet = texs[i];
						let tw = tet.width * scale, th = tet.height * scale;
						graphics.drawTexture(tet, sx, 0, tw, th);
						width = sx + tw;
						sx = width + distance;
						height = Math.max(th, height);
					}
				}
				else
					graphics.clear();
				self.width = width;
				self.height = height;
				// 执行更新回调
				let call = self.$upCall;
				call && call.call(self.$upThis);
			}
		}

		/**
		 * 更新尺寸
		 */
		protected updateScale(): void {
			var self = this;
			var value = self.$fontSize;
			if (!isNaN(value)) {
				let scale = value / self.$bSzie;
				// if (scale != self.$sScale) {
				// 	self.$sScale = scale;
				// 	self.update();
				// }
				// 如果出现所防冲突，再打开注释
				self.scale(scale, scale);
			}
		}

		/**
		 * 添加刷新回调
		 */
		public addUpdateCall(call: Function, thisObj?: any): void {
			var self = this;
			self.$upCall = call;
			self.$upThis = thisObj;
		}
	}
}