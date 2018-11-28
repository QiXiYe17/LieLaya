module lie {

	/**
	 * 可视化组件View模板类
	 * 功能：onCreate、onDestroy、onShow、onHide，自带清除监听
	 */
	export class UIView extends Laya.View implements IView {

		public isClear: boolean = true;	// 是否清除所有
		protected isDestroy: boolean;	// 是否已销毁对象

		constructor() {
			super();
			this.once(Laya.Event.DISPLAY, this, this.onCreate);
			this.once(Laya.Event.UNDISPLAY, this, this.$unDisplay);
		}

		/**
		 * 离开舞台调用，重写前需注意不要删除原有功能
		 */
		protected $unDisplay(): void {
			var self = this;
			if (self.isClear) {
				self.offAll();
				self.onDestroy();
				self.isDestroy = true;
			}
		}

		/**
		 * 加入舞台时调用（先加入再触发），此时父控件不为空，Laya自带的方法都是不存在父控件的
		 */
		protected onCreate(): void {
		}

		/**
		 * 离开舞台时调用（先触发再离开）
		 */
		protected onDestroy(): void {
		}

		/**
		 * 层级变化——显示，AppViews
		 */
		public onShow(): void {

		}

		/**
		 * 层级变化——被覆盖，AppViews
		 */
		public onHide(): void {

		}
	}
}