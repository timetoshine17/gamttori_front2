import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import CustomText from './_components/CustomText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '페이지를 찾을 수 없습니다' }} />
      <View style={styles.container}>
        <CustomText weight="Bold" style={styles.title}>
          페이지를 찾을 수 없습니다
        </CustomText>
        <CustomText style={styles.description}>
          요청하신 페이지가 존재하지 않습니다.
        </CustomText>
        <Link href="/login" style={styles.link}>
          <CustomText weight="Medium" style={styles.linkText}>
            로그인 페이지로 이동
          </CustomText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    color: '#6b7280',
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4b5563',
    borderRadius: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
  },
});
