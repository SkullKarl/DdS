// Service to manage the current shipment in transit state
export class EnvioStateService {
  private static currentEnvioId: string | null = null;
  private static listeners: Array<(envioId: string | null) => void> = [];

  /**
   * Sets the current envio ID that is in transit
   * @param envioId The ID of the envio in transit
   */
  static setCurrentEnvioId(envioId: string | null): void {
    this.currentEnvioId = envioId;
    this.notifyListeners();
  }

  /**
   * Gets the current envio ID that is in transit
   * @returns The current envio ID or null
   */
  static getCurrentEnvioId(): string | null {
    return this.currentEnvioId;
  }

  /**
   * Subscribes to changes in the current envio ID
   * @param listener Function to call when envio ID changes
   * @returns Unsubscribe function
   */
  static subscribe(listener: (envioId: string | null) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifies all listeners of changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentEnvioId);
    });
  }

  /**
   * Clears the current envio ID
   */
  static clearCurrentEnvioId(): void {
    this.setCurrentEnvioId(null);
  }
}
