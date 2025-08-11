import { View } from 'react-native';
import ThemedButton from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Props = {
  title: string;
  text: string;
  visible: boolean;
  cancelBtn?: boolean;
  onClose?: (ok: boolean) => void;
};

export function AlertComponent({
  title,
  text,
  visible,
  cancelBtn,
  onClose
}: Props) {
  if (!visible) {
    return <></>;
  }

  return (
    <>
      <ThemedView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000b4'
        }}
      ></ThemedView>
      <Animated.View
        key={'uniqueKey'}
        entering={FadeIn.duration(100)}
        exiting={FadeOut.duration(100)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <ThemedView
          style={{
            backgroundColor: '#1c1c1cff',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            minWidth: 300,
            justifyContent: 'center',
            borderRadius: 4,
            paddingHorizontal: 25,
            paddingVertical: 25,
            gap: 25
          }}
        >
          <View style={{ gap: 10 }}>
            <ThemedText style={{ fontWeight: 'bold' }}>{title}</ThemedText>
            <ThemedText style={{}}>{text}</ThemedText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginLeft: 'auto'
            }}
          >
            {cancelBtn && (
              <ThemedButton
                title="Cancel"
                style={{
                  backgroundColor: '#0d0d0dff',
                  paddingHorizontal: 0,
                  width: 85
                }}
                rippleColor="#171717ff"
                onPress={() => onClose?.(false)}
              />
            )}
            <ThemedButton
              title="OK"
              style={{
                backgroundColor: '#03305dff',
                paddingHorizontal: 0,
                width: 85
              }}
              rippleColor="#002244ff"
              onPress={() => onClose?.(true)}
            />
          </View>
        </ThemedView>
      </Animated.View>
    </>
  );
}
