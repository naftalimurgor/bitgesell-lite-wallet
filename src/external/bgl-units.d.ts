declare module 'bgl-units' {
  /**
   * Convert Satoshi (smallest BGL units) to BGL.
   * @param satoshi - Amount of Satoshi to convert. Must be a whole number.
   * @throws {TypeError} Thrown if input is not a number or string.
   * @throws {TypeError} Thrown if input is not a whole number or string format whole number.
   * @returns The equivalent amount in BGL.
   */
  export function toBGL(satoshi: number | string): number;

  /**
   * Convert Bitgesell to Satoshi units.
   * @param BGL - Amount of Bitgesell to convert.
   * @throws {TypeError} Thrown if input is not a number or string.
   * @returns The equivalent amount in Satoshi units.
   */
  export function toSatoshiUnits(BGL: number | string): number;
}
