import {Platform, StyleSheet} from 'react-native';
import colors from '../colors/colors';

const globalStyle = StyleSheet.create({
  backgroundWhite: {
    backgroundColor: 'white',
    flex: 1,
  },
  backgroundBlack: {
    backgroundColor: colors.darkGrey,
    flex: 1,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 30 : 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  input: {
    width: '100%',
    color: colors.darkGrey,
    backgroundColor: colors.greyCream,
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.grey,
    height: Platform.OS === 'ios' ? 55 : 50,
    lineHeight: Platform.OS === 'ios' ? undefined : 20,
    textAlignVertical: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 15,
  },
});

export default globalStyle;
