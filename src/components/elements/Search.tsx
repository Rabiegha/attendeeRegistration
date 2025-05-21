import React from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import colors from '../../assets/colors/colors';
import Icons from '../../assets/images/icons';

interface SearchProps {
  onChange: (text: string) => void;
  value: string;
  placeholder?: string;
}

const Search = ({ onChange, value, placeholder = 'Search...' }: SearchProps) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={Icons.Rechercher}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          placeholderTextColor={colors.grey}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Image
              source={Icons.Fermer}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50, // Ensure full width on tablet screens
    borderWidth: 1,
    borderColor: colors.green,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: colors.green,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.dark,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  clearIcon: {
    width: 16,
    height: 16,
    tintColor: colors.green,
  },
});

export default Search;
