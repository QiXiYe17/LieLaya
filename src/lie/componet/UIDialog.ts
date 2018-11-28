module lie {

	/**
	 * 可视化组件Dialog模板类
	 */
	export class UIDialog extends UIView {

		protected obscure: Laya.Sprite;		// 背景朦层

		private m_pCall: Function;
		private m_pThis: any;

		/**
		 * 此时已有宽高
		 */
		protected initialize(): void {
			super.initialize();
			this.initObscure();
		}

		/**
		 * 重写
		 */
		protected $unDisplay(): void {
			super.$unDisplay();
			var self = this;
			if (self.isDestroy) {
				let call = self.m_pCall;
				if (call) {
					let m_pThis = self.m_pThis;
					self.callLater(function () {
						call.call(m_pThis);
					});
				}
				self.m_pCall = self.m_pThis = null;
			}

		}

		/**
		 * 初始化朦层
		 */
		protected initObscure(): void {
			var self = this;
			var stage = Laya.stage;
			var rect = self.obscure = new Laya.Sprite;
			var width = rect.width = stage.width;
			var height = rect.height = stage.height;
			rect.x = (self.width - width) / 2;
			rect.y = (self.height - height) / 2;
			rect.graphics.drawRect(0, 0, width, height, '#000000');
			self.addChildAt(rect, 0);
			self.setObscureAlpha(0.5);
			EventUtils.addClickListener(rect, self.onClickObs, self);
		}

		/**
		 * 点击了遮罩，阻挡监听
		 */
		protected onClickObs(): void {

		}

		/**
		 * 设置朦层的透明度
		 */
		public setObscureAlpha(alpha: number): void {
			this.obscure.alpha = alpha;
		}

		/**
		 * 添加关闭回调
		 */
		public addCloseCall(call: Function, thisObj?: any): void {
			var self = this;
			self.m_pCall = call;
			self.m_pThis = thisObj;
		}

		/**
		 * 关闭窗口
		 */
		protected onClose(event: Laya.Event): void {
			event.stopPropagation();
			this.removeSelf();
		}
	}
}