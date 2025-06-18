export interface MultiDisplayManagerPlugin {
  showOnSecondScreen(options: { url: string }): Promise<void>;
}
