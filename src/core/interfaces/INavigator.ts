export interface INavigator {

  toUp(): void;
  toDown(): void;
  toLeft(): void;
  toRight(): void;

  toClockwiseConnected(): void;
  toCounterClockwiseConnected(): void;

  toClockwiseActive(): void;
  toCounterClockwiseActive(): void;
}
