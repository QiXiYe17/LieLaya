module lie {

	var getM = 'get', postM = 'post';

	/**
	 * Http请求类
	 */
	export class Http {

		public notify: boolean;	// 是不是主动接受请求，不管请求的结果是错还是对
		public isText: boolean;	// 是否是文本格式

		private $loading: number;
		private $timeout: number;
		private $request: Laya.HttpRequest;
		private $comCall: (any) => void;
		private $errorCall: (any) => void;
		private $thisObj: any;

		protected constructor(method: string, param: any, url?: string) {
			var request = this.$request = new Laya.HttpRequest();
			var headers = void 0;
			if (method == postM)
				headers = ["Content-Type", "application/x-www-form-urlencoded"];
			request.send(url || Server.HOST, Http.getUrlParam(param), method, void 0, headers);
		}

		/**
		 * 添加返回请求
		 */
		protected addCall(call: (any) => void, error: (any) => void, thisObj?: any): void {
			var self = this;
			var request = self.$request;
			self.$comCall = call;
			self.$errorCall = error;
			self.$thisObj = thisObj;
			request.once(Laya.Event.COMPLETE, self, self.onGetComplete);
			request.once(Laya.Event.ERROR, self, self.onGetIOError);
			self.$loading = setTimeout(self.showLoading, self, 400);
		}

		/**
		 * 显示loading
		 */
		protected showLoading(): void {
			var self = this;
			self.$loading = null;
			pfUtils.showLoading();
			// 超时检测
			self.$timeout = setTimeout(self.onGetIOError, self, 10000);
		}

		/**
		 * 执行回调
		 */
		protected excuteCall(action: ITFPushAction): void {
			var self = this;
			var call = self.$comCall;
			if (call) {
				let thisObj = self.$thisObj;
				// 主动控制，全返回
				if (self.notify)
					call.call(thisObj, action);
				else {
					let code = action.errorCode;
					let info = action.info;
					// 非主动控制，只返回info和code
					if (code) {
						let error = self.$errorCall;
						error && error.call(thisObj, code);
						AppConfig.onErrorCode(code, info);
					}
					else
						call.call(thisObj, info);
				}
				self.clear();
			}
			// 关闭
			if (self.$loading) {
				clearTimeout(self.$loading);
				self.$loading = null;
			}
			else if (self.$timeout) {
				clearTimeout(self.$timeout);
				self.$timeout = null;
				pfUtils.hideLoading();
			}
		}

		/**
		 * 请求成功
		 */
		private onGetComplete(event: Laya.Event): void {
			var self = this;
			var request = self.$request;
			var response = request.data;
			try {
				let isText = self.isText;
				let data = isText ? response : JSON.parse(response);
				!isText && console.log('onReceive', data);
				self.excuteCall(data);
			} catch (e) {
				self.notify && self.excuteCall(ActionUtils.getInfoAction(response))
				console.log('error response', e, response);
			}
		}

		/**
		 * 请求失败
		 */
		private onGetIOError(): void {
			this.excuteCall(ActionUtils.getFailAction());
		}

		/**
		 * 清除请求
		 */
		public clear(): void {
			var self = this;
			self.$request.offAll();
			self.$request = self.$comCall = self.$errorCall = self.$thisObj = null;
		}

		// 静态方法

		/**
		 * 获取伴随url的参数
		 */
		public static getUrlParam(param: any, sortFunc?: (a: string, b: string) => number): string {
			let isO = TypeUtils.isObject;
			let str = JSON.stringify;
			let attr = [];
			for (let i in param) {
				let data = param[i];
				if (isO(data)) {
					data = str(data);
				}
				attr.push(i + '=' + data);
			}
			sortFunc && attr.sort(sortFunc);
			return attr.join('&');
		}

		/**
		 * 发送请求
		 */
		private static send(method: string, type: ActionType, data?: any, notify?: boolean): Promise<any> {
			var action = ActionUtils.newAction(type, function (info: any) {
				for (let i in data)
					info[i] = data[i];
			});
			if (action)
				return Http.sendAction(method, action, notify);
		}

		/**
		 * 发送action请求
		 */
		private static sendAction(method: string, action: ITFSendAction, notify?: boolean): Promise<any> {
			return new Promise<any>(function (resolve, reject) {
				let http = new Http(method, action);
				http.notify = notify;
				http.addCall(resolve, reject);
			});
		}

		/**
		 * 发送get请求
		 * @param type 请求类型
		 * @param param 请求参数
		 * @param call 请求成功回调
		 * @param thisObj 回调所属对象
		 */
		public static get(type: ActionType, param?: any, notify?: boolean): Promise<any> {
			return Http.send(getM, type, param, notify);
		}

		/**
		 * 发送post请求
		 * @param type 请求类型
		 * @param param 请求参数
		 * @param call 请求成功回调
		 * @param thisObj 回调所属对象
		 */
		public static post(type: ActionType, param?: any, notify?: boolean): Promise<any> {
			return Http.send(postM, type, param, notify);
		}

		/**
		 * 发送get action
		 */
		public static getAction(action: ITFSendAction, notify?: boolean): Promise<any> {
			return Http.sendAction(getM, action, notify);
		}

		/**
		 * 发送post action
		 */
		public static postAction(action: ITFSendAction, notify?: boolean): Promise<any> {
			return Http.sendAction(postM, action, notify);
		}

		////////////非action形式的请求

		/**
		 * 发送请求
		 * @param data 发送的数据，包含地址、请求类型(默认post)、请求参数、请求成功回调
		 */
		public static request(data: { url: string, method?: string, isText?: boolean, param?: any }): Promise<any> {
			var http = new Http(data.method, data.param, data.url);
			http.isText = data.isText;
			http.notify = true;	// 主动唤醒，自由控制
			return new Promise<any>(function (resolve, reject) {
				http.addCall(resolve, reject);
			});
		}
	}
}