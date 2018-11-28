module lie {

	/**
	 * vector3的缓间动画
	 */
	export class TweenVector3 {

		private $vector: Laya.Vector3;
		private $onChange: Function;
		private $thisObj: any;

		protected constructor(from: Laya.Vector3, to: Laya.Vector3, time: number, call: (t: Laya.Vector3) => void, thisObj?: any, ease?: TEaseFunc) {
			var vector = this.$vector = from.clone();
			this.$onChange = call;
			this.$thisObj = thisObj;
			Tween.get(vector, {
				frameCall: this.update, frameObj: this
			}).to({
				x: to.x, y: to.y, z: to.z
			}, time, ease).call(() => {
				this.update();
				this.clear();
			});
		}

		/**
		 * 执行回调
		 */
		public update(): void {
			var self = this;
			var call = self.$onChange;
			call && call.call(self.$thisObj, self.$vector);
		}

		/**
		 * 清除
		 */
		public clear(): void {
			var self = this;
			Tween.clear(self.$vector);
			self.$onChange = self.$thisObj = self.$vector = null;
		}

		/**
		 * 创建V3d动画对象
		 * @param from 当前值
		 * @param to 最终值
		 * @param time 变化时间
		 * @param call 变化回调，参数：当前帧的值
		 * @param thisObj 回调所属对象
		 */
		public static create(from: Laya.Vector3, to: Laya.Vector3, time: number, call: (t: Laya.Vector3) => void, thisObj?: any): TweenVector3 {
			return new TweenVector3(from, to, time, call, thisObj);
		}

		/**
		 * 创建3D变化对象的属性的动画对象
		 * @param transform 3D变化对象
		 * @param attr transform的属性值
		 * @param to 最终值
		 * @param time 变化时间
		 * @param ease 变化规律
		 */
		private static $createTF(transform: Laya.Transform3D, attr: string, to: Laya.Vector3, time: number, ease?: TEaseFunc): TweenVector3 {
			return new TweenVector3(transform[attr], to, time, function (v) {
				transform[attr] = v
			}, null, ease);
		}

		/**
		 * 创建3D变化对象position变化动画对象
		 * @param transform 3D变化对象
		 * @param to 最终值
		 * @param time 变化时间
		 * @param ease 变化规律
		 */
		public static createPos(transform: Laya.Transform3D, to: Laya.Vector3, time: number, ease?: TEaseFunc): TweenVector3 {
			return TweenVector3.$createTF(transform, 'position', to, time, ease);
		}

		/**
		 * 创建3D变化对象localRotationEuler变化动画对象
		 * @param transform 3D变化对象
		 * @param to 最终值
		 * @param time 变化时间
		 * @param ease 变化规律
		 */
		public static createLRotE(transform: Laya.Transform3D, to: Laya.Vector3, time: number, ease?: TEaseFunc): TweenVector3 {
			return TweenVector3.$createTF(transform, 'localRotationEuler', to, time, ease);
		}
	}
}