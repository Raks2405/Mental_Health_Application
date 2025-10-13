import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';

export default function Books() {
  return (
    <View style={s.container}>
      <View style={s.row}>
        <Text style={[s.cell, s.active]}>Books</Text>
        <Link href='/(tabs)/home/articles' asChild>
          <Pressable style={s.cell}>
            <Text style={{color: 'white'}}>Articles</Text>
            </Pressable>
        </Link>
        <Link href='/(tabs)/home/videos' asChild>
          <Pressable style={s.cell}>
            <Text style={{color: 'white'}}>Videos</Text>
            </Pressable>
        </Link>
      </View>

      <View style={s.body}>
        <Text>Books content</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 15
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    margin: 3,
    backgroundColor: '#002532ff',
  },
  active: {
    textAlign: 'center',
    fontWeight: '900',
    color: 'white',
    backgroundColor: '#002532ff',
    borderColor: '#ffffffff',
    borderWidth: 2,
     ...Platform.select({
                ios: {
                    shadowOffSet: { width: 2, height: 2 },
                    shadowColor: '#000000ff',
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                },
    
                android: {
                    elevation: 8,
                }
            })
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
