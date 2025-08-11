import { StatusBar, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import StartComponent from '../components/onboarding/StartComponent';
import { useState } from 'react';
import ConnectServerComponent from '../components/onboarding/ConnectServerComponent';
import ThemedButton from '../components/ThemedButton';
import ReadyComponent from '../components/onboarding/ReadyComponent';
import { useRouter } from 'expo-router';

const screens = [StartComponent, ConnectServerComponent, ReadyComponent];

export default function OnboardingScreen() {
  const [currScreen, setCurrScreen] = useState(0);
  const [canGoNext, setCanGoNext] = useState(false);
  const router = useRouter();

  const Screen = screens[currScreen];

  return (
    <ThemedView style={styles.background}>
      <ThemedText style={styles.title} type="title">
        Eris Setup
      </ThemedText>
      <View
        style={{
          flex: 1
        }}
      >
        <Screen onValidationChange={value => setCanGoNext(value)} />
      </View>
      <View style={styles.buttons}>
        <ThemedButton
          title="Back"
          style={{ backgroundColor: '#121212' }}
          onPress={() => setCurrScreen(curr => Math.max(curr - 1, 0))}
        />
        <ThemedButton
          title={currScreen >= screens.length - 1 ? 'Finish' : 'Next'}
          style={{ backgroundColor: canGoNext ? '#50328dff' : '#2f2447ff' }}
          // rippleColor="#411e86ff"
          // backgroundColor='#50328dff' // 40286f
          onPress={() => {
            if (currScreen >= screens.length - 1) {
              // Done with setup, go to home page!

              router.replace('/(tabs)/songs');
              return;
            }

            if (canGoNext) {
              setCanGoNext(false);
              setCurrScreen(curr => Math.min(curr + 1, screens.length - 1));
            }
          }}
        />
      </View>
      <View>{/* TODO: circles here */}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingTop: StatusBar.currentHeight,
    flex: 1
  },
  title: {
    textAlign: 'center',
    marginVertical: 10
  },
  tagline: {
    textAlign: 'center'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 20,
    marginBottom: 150
  },
  button: {
    backgroundColor: '#121212',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 3
  },
  buttonText: {
    color: 'white'
  }
});
