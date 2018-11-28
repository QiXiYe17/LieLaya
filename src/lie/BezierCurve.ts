module lie {

	export interface Point {
		x: number;
		y: number;
	}

	/**
	 * 贝塞尔曲线
	 */
	export class BezierCurve {

		protected constructor() {
		}

		/**
		 * C(n,i)的值
		 */
		public static cni(n: number, i: number): number {
			i > n / 2 && (i = n - i);		// C(n,i)=C(n,n-i)
			var s0: number = 1;
			var s1: number = 1;
			for (let k = 0; k < i; k++) {
				s0 *= (n - k);
				s1 *= (k + 1);
			}
			return s0 / s1;
		}

		/**
		 * 假设N次贝塞尔曲线，则它需要确定的坐标数是N+1
		 * @param points 第一个和最后一个坐标分别为起终点，其余为作用力点，可以没有作用力点，效果是直线
		 * @param value 0-1
		 */
		public static bezierAt(points: Point[], value: number): Point {
			var n: number = points.length - 1;
			var x: number = 0;
			var y: number = 0;
			var cni = BezierCurve.cni;
			var pow = Math.pow;
			for (let i = 0; i <= n; i++) {
				let pi = points[i];
				let xs = cni(n, i) * pow(1 - value, n - i) * pow(value, i);
				x += pi.x * xs;
				y += pi.y * xs;
			}
			return { x: x, y: y };
		}

		/**
		 * 运行贝塞尔曲线
		 * @param target 运行对象
		 * @param points 运行轨迹
		 * @param during 运行时间
		 * @param onFinish 运行结束回调
		 * @param thisObject 回调对象
		 * @param params 回调参数
		 */
		public static run(target: Point, points: Point[], during: number,
			onFinish?: Function, thisObject?: any, ...params: any[]): void {
			var timer = Laya.timer;
			var startTime = Date.now();
			var method = function () {
				let curPro: number = Date.now() - startTime;
				let precent: number = curPro > during ? 1 : curPro / during;
				let point = BezierCurve.bezierAt(points, precent);
				target.x = point.x;
				target.y = point.y;
				if (precent == 1) {
					timer.clear(null, method);
					onFinish && onFinish.apply(thisObject, params);
				}
			};
			timer.frameLoop(1, null, method);
		}

		/**
		 * 运行多段贝塞尔曲线
		 * @param target 运行对象
		 * @param points 运行轨迹，二维数组
		 * @param durings 运行时间数组，每个数表示每条曲线的运行时间，若是数字则每段曲线时间一样
		 * @param onFinish 运行结束回调
		 * @param thisObject 回调对象
		 * @param params 回调参数
		 */
		public static runs(target: Point, points: Point[][], durings: number | number[],
			onFinish?: Function, thisObject?: any, ...params: any[]): void {
			var timer = Laya.timer;
			var startTime = Date.now();
			var dur = function (index: number): number {
				if (typeof durings === 'number')
					return durings;
				return durings[index];
			};
			var count: number = 0;
			var length: number = points.length;
			var method = function () {
				let during = dur(count);
				let curPro: number = Date.now() - startTime;
				let precent: number = curPro > during ? 1 : curPro / during;
				let point = BezierCurve.bezierAt(points[count], precent);
				target.x = point.x;
				target.y = point.y;
				if (precent == 1) {
					count++;
					startTime += during;
				}
				if (count == length) {
					timer.clear(null, method);
					onFinish && onFinish.apply(thisObject, params);
				}
			}
			timer.frameLoop(1, null, method);
		}
	}
}