module lie {

    /**
     * 工具类，存放一些常用的且不好归类的方法
     */
    export class Utils {

        // 工具私有变量，请勿乱动

        /**
         * 初始化一个长度为length，值全为value的数组
         * 注意，由于数组公用一个value，因此，value适用于基础类型，对于对象类的，请用memset2方法
         */
        public static memset<T>(length: number, value: T): T[] {
            return Array.apply(null, Array(length)).map(function () { return value; });
        }

        /**
         * 初始化一个长度为length，值通过getValue函数获取，注意getValue第一个参数是没用，第二个参数是当前数组的下标，即你返回的数据将存放在数组的该下标
         */
        public static memset2<T>(length: number, getValue: (value?: T, index?: number) => T): T[] {
            return Array.apply(null, Array(length)).map(getValue);
        }

        /**
         * 获取网页参数
         */
        public static getQueryString(name: string): string {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var ret = window.location.search.substr(1).match(reg);
            return ret ? decodeURIComponent(ret[2]) : '';
        }

        /**
         * 自定义格式化字符串
         * @param reg 正则
         * @param str 字符串
         * @param args 填充参数
         */
        public static formatStringReg(reg: RegExp, str: string, args: any[]): string {
            for (let i in args) {
                let arg = args[i];
                if (reg.test(str))
                    str = str.replace(reg, args[i]);
                else
                    break;
            }
            return str;
        }

        /**
         * 格式化字符串
         */
        public static formatString(str: string, ...args: any[]): string {
            str = str.replace(/%%/g, '%');  // 有些识别问题出现两个%号
            return Utils.formatStringReg(/%d|%s/i, str, args);  // 忽略大小写
        }

        /**
         * 二次延迟
         */
        public static callLater(call: Function, thisObj?: any, ...params: any[]): void {
            var timer = Laya.timer;
            timer.callLater(null, function () {
                timer.callLater(null, function () {
                    call.apply(thisObj, params);
                });
            });
        }

        /**
         * 数学sin cos
         */
        private static mathSinCos(attr, angle: number): number {
            return Math[attr](angle * Math.PI / 180);
        }

        /**
         * sin
         * @param angle 角度，0~360
         */
        public static sin(angle: number): number {
            return Utils.mathSinCos('sin', angle);
        }

        /**
         * cos
         * @param angle 角度，0~360
         */
        public static cos(angle: number): number {
            return angle % 180 == 90 ? 0 : Utils.mathSinCos('cos', angle);
        }

        /**
         * tan
         * @param angle 角度，0~360
         */
        public static tan(angle): number {
            return Utils.mathSinCos('tan', angle);
        }

        /**
         * 求一个点x,y逆时针旋转angle角度之后的坐标
         */
        public static getRotatPoint(x: number, y: number, angle: number): number[] {
            var self = Utils;
            var cos = self.cos, sin = self.sin;
            var x0 = x * cos(angle) - y * sin(angle);
            var y0 = x * sin(angle) + y * cos(angle);
            return [x0, y0];
        }

        //////// 动画 ////////

        /**
         * 添加抖动动画
         */
        public static addShakeTween(target: Laya.Sprite, loop?: boolean): lie.Tween {
            var width = target.width;
            var scale0 = (width + 20) / width, scale1 = (width + 10) / width;
            var time = 200;
            return Tween.get(target, { loop: loop }).to({
                scaleX: scale0,
                scaleY: scale0
            }, time).to({
                scaleX: scale1,
                scaleY: scale1
            }, time / 2).to({
                scaleX: scale0,
                scaleY: scale0
            }, time / 2).to({
                scaleX: 1,
                scaleY: 1
            }, time).wait(time * 4);
        }

        /**
         * 添加闪烁效果
         */
        public static addBlinkTween(target: Laya.Sprite, time: number = 150): void {
            Tween.get(target, { loop: true }).to({
                alpha: 0
            }, time).to({
                alpha: 1
            }, time);
        }

        // /**
        //  * 添加上下跳动的动画
        //  * @param distance 上下跳动的距离
        //  * @param attr 控件上下的属性，默认verticalCenter，可采用其他会影响控件位移的属性即可
        //  */
        // public static addUpAndDownTween(view: Laya.Sprite, distance: number, attr: string = 'verticalCenter'): void {
        //     var time = 200, time2 = time * 1.2;
        //     var oldc = view[attr];
        //     var getObj = function (sub: number) {
        //         let obj = {};
        //         obj[attr] = oldc + sub * distance;
        //         return obj;
        //     };
        //     egret.Tween.get(view, { loop: true }).to(
        //         getObj(-1), time).to(
        //         getObj(1), time2).to(
        //         getObj(-1), time2).to(
        //         getObj(1), time2).to(
        //         getObj(0), time).wait(400);
        // }

        /**
         * 缩放动画，默认elasticOut
         */
        public static addScaleTween(view: Laya.Sprite, model: TEaseFunc = Ease.elasticOut): Tween {
            view.scaleX = view.scaleY = 0;
            return Tween.get(view).to({ scaleX: 1, scaleY: 1 }, 600, model);
        }

        /**
         * 检测点是否在矩形上
         */
        public static pointInRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }): boolean {
            x -= rect.x;
            y -= rect.y;
            return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
        }

        /**
         * 重写子属性方法
         * @param obj 对象
         * @param attr 属性
         * @param call 重写回调
         * @param thisObj 回调函数
         */
        public static rewriteFunc(obj: any, attr: string, call: Function, thisObj?: any): void {
            var func = obj[attr];
            obj[attr] = function () {
                func.apply(obj, arguments);
                call.apply(thisObj, arguments);
            };
        }

        /**
         * 数值转为RGB
         */
        public static getRGB(value: number = 0): number[] {
            var rgb = [], count = 3;
            do {
                rgb.unshift(value % 256);
                value = value / 256 | 0;
            } while (--count);
            return rgb;
        }

        /**
         * 随机排序数组
         * @param array 数组
         * @param copy 是否复制一份新数组，即true时不改变array原来的顺序
         */
        public static randomSort<T>(array: T[], copy?: boolean): T[] {
            copy && (array = array.concat());
            return array.sort(function () { return Math.random() - 0.5 });
        }

        /**
         * 随机范围内取整，注意返回整数
         * @param min 最小值
         * @param max 最大值
         * @returns [min, max]
         */
        public static randomRange(min: number, max: number): number {
            return Math.random() * (max - min) + min | 0;
        }

        /**
         * 检测两个对象是否相等
         */
        public static isSame(obj0: any, obj1: any): boolean {
            if (obj0 != obj1) {
                let key0 = Object.keys(obj0);
                let key1 = Object.keys(obj0);
                if (key0.length == key1.length) {
                    for (let i in key0) {
                        let key = key0[i];
                        if (!Utils.isSame(obj0[key], obj1[key]))
                            return false;
                    }
                }
                else
                    return false;
            }
            return true;
        }

        /**
         * 获取正百分比value % range
         * @param value 求余的值
         * @param range 被求余的值
         */
        public static getPstPercent(value: number, range: number): number {
            value %= range;
            value |= 0;
            if (value < 0) {
                value = (value + range) % range;
            }
            return value;
        }

        /**
         * 是不是没有值
         */
        public static isNoValue(obj: any): boolean {
            return !obj && (obj === void 0 || obj === null ||
                isNaN(obj) || obj === Infinity);
        }

        /**
         * 复制一个对象
         * @param obj 需要复制的对象
         * @param copy 被复制对象，不存在则创建
         * @returns 返回copy
         */
        public static copyObj<T>(obj: T, copy: T = Object.create(null)): T {
            for (let i in obj) {
                copy[i] = obj[i];
            }
            return copy;
        }

        /**
         * 播放上下移动动画
         */
        public static playQuadUpAni(display: Laya.Sprite, move: number, time: number, wait: number = 0): void {
            var oldX = display.x, oldY = display.y;
            Tween.get(display, { loop: true }).
                to({ x: oldX - move, y: oldY - move }, time, Ease.quadIn).
                to({ x: oldX, y: oldY }, time, Ease.quadOut).
                wait(wait);
        }

        /**
         * 取数组的随机值
         */
        public static randomInArray<T>(array: T[]): T {
            return array[Math.random() * array.length | 0];
        }

        /**
         * 将source的子项复制到target
         */
        public static pushArray(target: any[], source: any[]): void {
            for (let i in source)
                target.push(source[i]);
        }

        /**
         * 获取数组的和
         */
        public static getTotal(array: number[]): number {
            var sum = 0;
            for (let i = 0, len = array.length; i < len; i++)
                sum += array[i];
            return sum;
        }

        /**
         * 改变数组子项的下标，将原oldIdx的子项放到newIdx
         */
        public static changeIndex(array: any[], oldIdx: number, newIdx: number): void {
            if (oldIdx != newIdx) {
                let datas = array.splice(oldIdx, 1);
                array.splice(newIdx, 0, datas[0]);
            }
        }

        /**
         * 获取字符串长度
         */
        public static getStrLength(str: string): number {
            return str.replace(/[\u0391-\uFFE5]/g, "aa").length;
        }

        /**
         * 解析json字符串，解析失败则使用value的值
         * @param str 字符串
         * @param value 默认值
         */
        public static parseJson<T>(str: string, value: T): T {
            var data: T;
            if (str) {
                try {
                    data = JSON.parse(str);
                    if (TypeUtils.isSame(data, value))
                        value = data;
                } catch (e) {
                }
            }
            return value;
        }

        /**
         * 切割成数字数组
         * @param str 数组
         * @param format 切割符号
         */
        public static splitNumberArray(str: string, format: string): number[] {
            return str ? str.split(format).map(function (v) { return Number(v) }) : [];
        }

        /**
         * 切割成数字Map
         * @param str 数组
         * @param format 切割符号
         */
        public static splitNumberMap(str: string, format: string): { [key: string]: number } {
            var map = <{ [key: string]: number }>{}
            str && str.split(format).map(function (v) {
                map[v] = 1;
            });
            return map;
        }

        //////// 几何 ////////

        /**
         * 获取两点之间的角度
         * 注：点坐标和返回的角度采取白鹭的坐标系
         */
        public static getPointsAngle(x0: number, y0: number, x1: number, y1: number): number {
            if (x0 == x1)
                return y0 == y1 ? 0 : (y0 > y1 ? -90 : 90);
            var clzz = Math;
            var disx = (x1 - x0);
            var angle = clzz.atan((y1 - y0) / disx) / clzz.PI * 180;
            disx < 0 && (angle += 180);
            return angle;
        }

        /**
         * 获取两个点的垂直线上的两个点，新的两点距离等同于原两点的距离，即四点围成一正方形
         */
        public static getVerticalPoint(x0: number, y0: number, x1: number, y1: number): Laya.Point[] {
            var sqrt = Math.sqrt;
            var disX = x0 - x1, disY = y0 - y1;
            var cerX = (x0 + x1) / 2, cerY = (y0 + y1) / 2;
            var bdis = sqrt(disX * disX + disY * disY) / 2;
            if (disY == 0) {
                return [
                    new Laya.Point(cerX, cerY + bdis),
                    new Laya.Point(cerX, cerY - bdis)
                ];
            }
            // 垂直线的参数
            var k1 = -disX / disY, b1 = cerY - k1 * cerX;
            // 二元一次方程的参数值
            var e = b1 - cerY;
            var a = k1 * k1 + 1;
            var b = 2 * (e * k1 - cerX);
            var c = e * e + cerX * cerX - bdis * bdis;
            // 求解
            var r = sqrt(b * b - 4 * a * c);
            var x0 = (-b + r) / 2 / a;
            var x1 = (-b - r) / 2 / a;
            var p0 = new Laya.Point(x0, k1 * x0 + b1);
            var p1 = new Laya.Point(x1, k1 * x1 + b1);
            return [p0, p1];
        }

        /**
         * 置灰
         */
        public static setGray(view: Laya.Sprite, gray?: boolean): void {
            if (gray) {
                let colorMatrix = [
                    0.3, 0.6, 0, 0, 0,
                    0.3, 0.6, 0, 0, 0,
                    0.3, 0.6, 0, 0, 0,
                    0, 0, 0, 1, 0
                ];
                let colorFlilter = new Laya.ColorFilter(colorMatrix);
                view.filters = [colorFlilter];
            }
            else
                view.filters = null;
        }

        /**
         * 版本号比较，版本号的格式“xx.xx.xx”，即数字之间用统一的字符隔开
         * @param version0 版本号0
         * @param version1 版本号1
         * @param format 间隔符，默认'.'
         * @returns 1大于，-1小于，0相等
         */
        public static compareVesion(version0: string, version1: string, format: string = '.'): number {
            var array0 = version0.split(format);
            var array1 = version1.split(format);
            for (let i in array0) {
                let v0 = Number(array0[i]) || 0;
                let v1 = Number(array1[i]) || 0;
                if (v0 == v1)
                    continue;
                if (v0 > v1)
                    return 1;
                return -1;
            }
            return 0;
        }

		/**
		 * 是否有值
		 */
        public static hasValue(obj: any): boolean {
            // 右侧兼容空字符串和0
            return !!obj || (obj != null && obj != void 0);
        }

        /**
         * 指定位置改为大写，默认首字母大写
         * @param str 字符串
         * @param index 改为大写的位置，默认0
         */
        public static toUpperIndex(str: string, index: number = 0): string {
            var char = str[index];
            char && (char = char.toUpperCase());
            return str.substr(0, index) + char + str.substr(index + 1);
        }

        /**
         * 检测两个对象是否相等
         * @param obj0 
         * @param obj1 
         * @param key 
         */
        public static checkObj(obj0: any, obj1: any, key: string = "") {
            var isO = TypeUtils.isObject;
            var isO0 = isO(obj0);
            var isO1 = isO(obj1);
            if (isO0 == isO1) {
                if (isO0) {
                    for (let i in obj0) {
                        Utils.checkObj(obj0[i], obj1[i], key + '/' + i);
                    }
                }
                else if (obj0 !== obj1) {
                    console.log('noSame ' + key, obj0, obj1);
                }
            }
            else {
                console.log('noSame ' + key, obj0, obj1);
            }
        }

        /**
         * 创建Handler，增加类型约束
         * @param call 
         * @param thisObj 
         */
        public static createHandler<T>(call: (arg: T) => void, thisObj?: any): Laya.Handler {
            return Laya.Handler.create(thisObj, call);
        }
    }
}