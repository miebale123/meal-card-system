import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSize } from '../theme';

const services = [
  { href: '/meals', name: 'Meal card', description: 'Tick a student’s meal for today.' },
  { href: '/dorm', name: 'Dormitory', description: 'Save a student’s room, bed, and number of items.' },
  { href: '/clinic', name: 'Clinic', description: 'Register a diagnosis and prescription.' },
];

export default function HomeScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {services.map((service) => (
        <Link key={service.href} href={service.href} asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.tile, pressed ? styles.pressed : null]}>
            <Text style={styles.name}>{service.name}</Text>
            <Text style={styles.description}>{service.description}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
  },
  tile: {
    padding: 20,
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.ink,
  },
  description: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
});
