module lie {

	/**
	 * 仅首次then有效的Promise
	 * 使用场景：在Promise还未返回时同时触发多次promise时，仅想第一次有效或者promise对象只需要一个即可时可采取该类。
	 * 例如：微信看视频，由于视频弹出较慢，玩家可能会点击多次按钮，促使弹出多个视频，这很明显不合理。
	 *   弹视频需要做到旧视频未关闭新视频不能出来，因此pomise只需要一个对象即可，按钮点击可以继续触发promise，
	 *   但由于是同一个对象，且不发生其他操作，简化了UI类的使用。
	 */
	export class FPromise<T> {

		private $promise: Promise<T>;

		public constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
			this.$promise = new Promise(executor);
		}

		/**
		 * 是否首次调用then
		 */
		private $firstT: boolean;
		/**
		 * 是否首次调用catch
		 */
		private $firstC: boolean;
		/**
		 * 模仿Promise对象的空函数对象
		 */
		private $space: any = {
			then: function () { }, catch: function () { }
		};

		/**
		 * 功能同Promise.then但是没有返回
		 */
		public then(onfulfilled?: ((value?: T) => any | PromiseLike<any>) | undefined | null, onrejected?: ((reason: any) => T | PromiseLike<T>) | undefined | null): FPromise<T> {
			var self = this;
			if (!self.$firstT) {
				self.$firstT = true;
				self.$promise.then(onfulfilled, onrejected);
			}
			return self;
		}

		/**
		 * 功能同Promise.catch但是没有返回
		 */
		public catch(onrejected?: ((reason: any) => any | PromiseLike<T>) | undefined | null): FPromise<T> {
			var self = this;
			if (!self.$firstC) {
				self.$firstC = true;
				self.$promise.catch(onrejected);
			}
			return self;
		}
	}
}