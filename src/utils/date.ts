// 常用的日期格式化工具

/**
 * 将 Date / 时间戳 / 字符串 转换为指定格式的日期字符串。
 * 支持的格式符号：
 *   YYYY  年
 *   MM    月（补 0）
 *   DD    日（补 0）
 *   HH    时（24）
 *   mm    分
 *   ss    秒
 *
 * @param input  要格式化的值，Date 对象或可被 new Date() 解析的值
 * @param fmt    格式串，默认 `YYYY-MM-DD HH:mm:ss`
 */
export function formatDate(input: Date | string | number, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = input instanceof Date ? input : new Date(input)
  if (isNaN(d.getTime())) return ''

  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))

  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  }

  return fmt.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => map[match] || match)
}
