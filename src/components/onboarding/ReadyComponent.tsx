import { useEffect, useState } from 'react';
import { ThemedText } from '../ThemedText';
import ThemedButton from '../ThemedButton';
import { View } from 'react-native';

type Props = {
  onValidationChange(value: boolean): void;
};

export default function ReadyComponent({ onValidationChange }: Props) {
  useEffect(() => {
    onValidationChange(true);
  }, [onValidationChange]);

  return (
    <View style={{ alignItems: 'center', gap: 15, justifyContent: 'center', height: '100%'}}>
      <ThemedText style={{ textAlign: 'center', fontSize: 25, fontWeight: 'bold' }} type="default">
        All done! Enjoy &lt;3
      </ThemedText>
    </View>
  );
}
