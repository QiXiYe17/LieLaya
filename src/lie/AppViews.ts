module lie {

	var app: AppViews;	// 存放单例

	var getTop = function (view: Laya.Sprite) {
		return view._childs[view.numChildren - 1];
	};

	/**
	 * 层级容器
	 */
	class Container extends Laya.Sprite {

		/**
		 * 移除子控件触发
		 */
		public removeChildAt(index: number): Laya.Node {
			var self = this;
			var node = super.removeChildAt(index);
			// 移除成功且为该层级最顶层控件
			if (node) {
				let num = self.numChildren;
				if (index == num) {
					// 当前层级最顶层
					let last = AppViews.getTopComponent(self);
					if (last) {
						let onShow = last.onShow;
						onShow && last.onShow();
					}
				}
			}
			return node;
		}

		/**
		 * 重写子控件发生变化
		 */
		protected _childChanged(child?: Laya.Node): void {
			super._childChanged(child);
			var self = this;
			self.mouseEnabled = self.numChildren > 0;
		}
	}

	/**
	 * AppViews存入的控件类型
	 */
	export interface IView extends Laya.Sprite {
		onShow?(): void;	// 上层界面关闭时触发下层的回调
		onHide?(): void;	// 位于顶层的界面再新增界面时触发回调
	}

	/**
	 * 应用的视图层级管理类
	 */
	export class AppViews {

		private $panelLevel: Container;	// 面板层
		private $dialogLevel: Container;// 对话框层
		private $topLevel: Container;	// 顶层

		protected constructor() {

		}

		/**
		 * 初始化
		 */
		private init(): void {
			var self = this;
			var clzz = AppViews;
			Laya.stage.destroyChildren();
			// 层级部署
			self.$panelLevel = self.addLevel('panel');
			// 对话框
			self.$dialogLevel = self.addLevel('dialog');
			//Laya.Dialog.manager;
			// dialog.name = 'dialog';
			// 顶层
			self.$topLevel = self.addLevel('top');
		}

		/**
		 * 获取面板层
		 */
		public get panelLevel(): Container {
			return this.$panelLevel;
		}

		/**
		 * 获取对话框层
		 */
		public get dialogLevel(): Container {
			return this.$dialogLevel;
		}

		/**
		 * 获取最顶层，注：顶层的东西随便加，记得清理
		 */
		public get topLevel(): Container {
			return this.$topLevel;
		}

		/**
		 * 添加层
		 * @param name 名称
		 */
		protected addLevel(name?: string): Container {
			var stage = Laya.stage;
			var container = new Container;
			container.name = name;
			container.width = stage.width;
			container.height = stage.height;
			stage.addChild(container);
			return container;
		}

		/**
		 * 获取层
		 */
		public getLevel(name?: string): Container {
			return <Container>Laya.stage.getChildByName(name);
		}

		/**
		 * 设置3D场景的容器
		 * @param scene 场景
		 * @param index 位置，默认最底，也就是说置于2D场景之下
		 * @param name 名称，多个场景时需要通过该值进行区分，暂未实现
		 */
		public setScene(scene: Laya.Sprite, index: number = 0, name: string = '3dScene'): void {
			scene.name = name;
			Laya.stage.addChildAt(scene, index);
		}

		// 静态

		/**
		 * 是否初始化界面
		 */
		public static get isInit(): boolean {
			return !!app;
		}

		/**
		 * 获取视图管理类单例
		 */
		public static app(): AppViews {
			if (!app) {
				app = new AppViews;
				app.init();
			}
			return app;
		}

		/**
		 * 设置屏幕是否能点击
		 */
		public static setTouchEnable(enable: boolean): void {
			Laya.stage.mouseEnabled = enable;
		}

		// 重点，层及控制管理体现

		/**
		 * 获取当前面板的最顶元素（该面板没有则取下一面板）
		 */
		public static getTopComponent(cont: Container): UIView {
			if (cont.numChildren == 0) {
				let parent = cont.parent;
				let index = parent.getChildIndex(cont);
				cont = null;
				for (let i = index - 1; i >= 0; i--) {
					cont = <Container>parent.getChildAt(i);
					// 仅非空容器
					if (cont instanceof Container && cont.numChildren)
						break;
				}
				if (!cont)
					return null;
			}
			return <UIView>cont._childs[cont.numChildren - 1];
		}

		/**
		 * 获取最顶的控件——对话框之下
		 */
		public static getTopCommont(): UIView {
			return AppViews.getTopComponent(AppViews.app().dialogLevel);
		}

		/**
		 * 获取当前面板
		 */
		public static get curPanel(): UIView {
			return app && getTop(app.panelLevel);
		}

		/**
		 * 获取当前对话框
		 */
		public static get curDialog(): UIDialog {
			return app && getTop(app.dialogLevel);
		}

		/**
		 * 获取当前顶层控件
		 */
		public static get curTop(): UIView {
			return app && getTop(app.topLevel);
		}

		/**
		 * 插入一个控件，并居中
		 * @param attr AppViews对象的属性名
		 * @param clzz 需要添加的对象类
		 */
		private static pushChild<T extends UIView>(attr: string, clzz: { new (...args: any[]): T }, data?: any): T {
			var self = AppViews;
			var child = new clzz(data);
			var container = <Container>self.app()[attr];
			var last = self.getTopComponent(container);	// 当前层级最顶层
			// 隐藏
			if (last) {
				let onHide = last.onHide;
				onHide && last.onHide();
			}
			self.setInCenter(child);
			container.addChild(child);
			return child;
		}

		/**
		 * 移除层里的控件
		 * @param attr AppViews对象的属性名
		 * @param clzz 需要移除的对象类
		 */
		private static removeChild(attr: string, clzz: { new (data?: any): UIView }): void {
			var panel = <Container>AppViews.app()[attr];
			var num = panel.numChildren;
			if (num > 0) {
				let top = panel.getChildAt(num - 1);
				for (let i = 0; i < num; i++) {
					let child = panel.getChildAt(i);
					if (child instanceof clzz) {
						panel.removeChildAt(i);
						i--;
						num--;
					}
				}
			}
		}

		/**
		 * 移除clzz其上面的面板，clzz不传参时则返回上一级
		 */
		private static backChild(attr: string, clzz?: any, data?: any): void {
			var self = AppViews;
			var panel = <Container>self.app()[attr];
			var num = panel.numChildren;
			if (!clzz) {
				panel.removeChildAt(--num);
			}
			else {
				let bool = false;
				for (let i = 0; i < num; i++) {
					let child = <IView>panel.getChildAt(i);
					if (child instanceof clzz) {
						i++;
						for (let j = i; j < num; j++)
							panel.removeChildAt(i);
						bool = true;
						break;
					}
				}
				!bool && self.pushChild(attr, clzz, data);
			}
		}

		/**
		 * 将子控件设置在父控件中心点
		 */
		public static setInCenter(child: Laya.Sprite): void {
			var stage = Laya.stage;
			child.x = (stage.width - child.width) / 2;
			child.y = (stage.height - child.height) / 2;
		}

		/**
		 * 新建一个面板并放入
		 */
		public static pushPanel<T extends UIView>(clzz: { new (...args: any[]): T }, data?: any): T {
			return AppViews.pushChild('panelLevel', clzz, data);
		}

		/**
		 * 新建一个对话框并放入
		 */
		public static pushDialog<T extends UIDialog>(clzz: { new (...args: any[]): T }, data?: any): T {
			return AppViews.pushChild('dialogLevel', clzz, data);
		}

		/**
		 * 新建一个顶层控件并放入
		 */
		public static pushTop<T extends UIView>(clzz: { new (...args: any[]): T }, data?: any): T {
			return AppViews.pushChild('topLevel', clzz, data);
		}

		/**
		 * 移除面板
		 */
		public static removePanel(clzz: { new (data?: any): UIView }): void {
			AppViews.removeChild('panelLevel', clzz);
		}

		/**
		 * 移除对话框
		 */
		public static removeDialog(clzz: { new (data?: any, data1?: any): UIDialog }): void {
			AppViews.removeChild('dialogLevel', clzz);
		}

		/**
		 * 移除顶层控件
		 */
		public static removeTop(clzz: { new (data?: any): UIView }): void {
			AppViews.removeChild('topLevel', clzz);
		}

		/**
		 * 移除clzz其上面的面板，clzz不传参时则返回上一面板，不存在则创建
		 * @param clzz 需要回到的面板
		 * @param data 如果不存在面板，则用于构造函数参数，否则不需要传
		 */
		public static backPanel(clzz?: any, data?: any): void {
			AppViews.backChild('panelLevel', clzz);
		}
	}
}