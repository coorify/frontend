export const useStatus = () => {
  const ENABLE = 0x01
  const DEFAULT = 0x02

  return {
    ENABLE,
    DEFAULT,

    isEnable (status: number): boolean {
      return (status & ENABLE) == ENABLE
    },
    isDefault (status: number): boolean {
      return (status & DEFAULT) == DEFAULT
    }
  }
}
