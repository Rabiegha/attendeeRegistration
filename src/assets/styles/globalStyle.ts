import { StyleSheet } from 'react-native';
import colors from '../colors/colors';

// Global styles with tablet optimization
const globalStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
    alignSelf: 'stretch',
  },
  backgroundWhite: {
    backgroundColor: colors.white,
    flex: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: colors.dark,
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 10,
  },
  smallText: {
    fontSize: 14,
    color: colors.grey,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: 10,
  },
});

export default globalStyle;
