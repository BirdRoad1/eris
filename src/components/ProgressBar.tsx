import { useRef } from 'react';
import { PanResponder, View, ViewStyle } from 'react-native';

type Props = {
  min: number;
  max: number;
  value: number;
  onValueChange?: (value: number) => void;
  style?: ViewStyle;
};

export default function ProgressBar({
  min,
  max,
  value,
  onValueChange,
  style
}: Props) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (ev, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: ev => {
        reportChange(ev.nativeEvent.pageX);
      },
      onPanResponderMove: ev => {
        reportChange(ev.nativeEvent.pageX);
      }
    })
  ).current;

  let percent = Math.floor((value / max) * 100);
  let barRef = useRef<View>(null);

  function reportChange(touchX: number) {
    if (!barRef.current) return;
    barRef.current.measure((x, y, width, height, pageX, pageY) => {
      const amt = (touchX - pageX) / width;
      onValueChange?.(Math.max(Math.min(amt * (max - min), max), min));
    });
  }

  return (
    <View
      style={{
        height: 10,
        width: 200,
        borderRadius: 2,
        backgroundColor: '#0c0c0cff',
        overflow: 'hidden',
        ...style
      }}
      ref={barRef}
      {...panResponder.panHandlers}
    >
      {percent > 0 && (
        <View
          style={{
            flex: 1,
            width: `${percent}%`,
            backgroundColor: '#2a18b0ff'
          }}
        ></View>
      )}
    </View>
  );
}
