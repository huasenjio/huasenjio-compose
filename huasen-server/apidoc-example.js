/**
 * 注意：
 * 1.['x1', 'x2']结构，左右两边需要有空格，否则字段解析失败；
 * 2.(group) {type}定义字段分组；
 * 3.字段描述文字使用 -> 后接示例格式；
 */

/**
 * @api {post} /user/backup 接口名称
 * @apiGroup 分组名
 * @apiHeader {type} token 票据
 * @apiParam {type} a 参数a
 * @apiParam {type} [b] 选填参数b
 * @apiParam {type} c=18 c参数默认值为18
 * @apiParam {type=json} d d参数只允许json
 * @apiParamExample {json} 请求参数示例:
 *     {
 *       "a": ""
 *       "b": ""
 *     }
 * @apiSuccessExample {json} 请求成功:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "",
 *       "lastname": ""
 *     }
 * @apiErrorExample {json} 请求失败:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": ""
 *     }
 */
