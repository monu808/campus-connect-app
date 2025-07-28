// PNG Icons Usage Sample
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ChatIcons, NavigationIcons, MatchingIcons, GamificationIcons } from './PngIcons';

const CodeBlock = ({ title, code }) => (
  <View style={styles.codeBlockContainer}>
    <Text style={styles.codeBlockTitle}>{title}</Text>
    <View style={styles.codeBlock}>
      <Text style={styles.code}>{code}</Text>
    </View>
  </View>
);

const IconExample = ({ title, description, children }) => (
  <View style={styles.exampleContainer}>
    <Text style={styles.exampleTitle}>{title}</Text>
    <Text style={styles.exampleDescription}>{description}</Text>
    <View style={styles.exampleContent}>
      {children}
    </View>
  </View>
);

const PngIconsUsageSample = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>PNG Icons Usage Examples</Text>
      
      <Text style={styles.subtitle}>1. Import Icons</Text>
      <CodeBlock 
        title="Import the icon groups you need:"
        code={"import { ChatIcons, NavigationIcons } from './PngIcons';"}
      />
      
      <Text style={styles.subtitle}>2. Basic Usage</Text>
      <IconExample
        title="Basic Icon"
        description="Use an icon with default size (24) and color (inherit):"
      >
        <View style={styles.row}>
          <ChatIcons.ChatBubble />
          <Text style={styles.codeInline}>{"<ChatIcons.ChatBubble />"}</Text>
        </View>
      </IconExample>
      
      <IconExample
        title="Icon with Custom Size"
        description="Set a custom icon size with the size prop:"
      >
        <View style={styles.row}>
          <NavigationIcons.Calendar size={36} />
          <Text style={styles.codeInline}>{"<NavigationIcons.Calendar size={36} />"}</Text>
        </View>
      </IconExample>
        <IconExample
        title="Original PNG Colors"
        description="PNG icons will display with their original colors:"
      >
        <View style={styles.row}>
          <MatchingIcons.Like size={30} />
          <Text style={styles.codeInline}>{"<MatchingIcons.Like size={30} />"}</Text>
        </View>
      </IconExample>
      
      <Text style={styles.subtitle}>3. Available Icon Groups</Text>
      <View style={styles.groupList}>
        <Text style={styles.groupItem}>• ChatIcons</Text>
        <Text style={styles.groupItem}>• NavigationIcons</Text>
        <Text style={styles.groupItem}>• MatchingIcons</Text>
        <Text style={styles.groupItem}>• GamificationIcons</Text>
        <Text style={styles.groupItem}>• NotificationIcons</Text>
        <Text style={styles.groupItem}>• FormIcons</Text>
        <Text style={styles.groupItem}>• SocialIcons</Text>
        <Text style={styles.groupItem}>• ProfileIcons</Text>
      </View>
      
      <Text style={styles.subtitle}>4. Practical Example</Text>      <CodeBlock 
        title="Using icons in a component:"
        code={`import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationIcons, GamificationIcons } from './PngIcons';

const MyComponent = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity 
        style={{ padding: 10 }}
        onPress={() => console.log('Back pressed')}
      >
        <NavigationIcons.Back size={24} />
      </TouchableOpacity>
      
      <Text style={{ flex: 1, textAlign: 'center' }}>
        Screen Title
      </Text>
      
      <TouchableOpacity 
        style={{ padding: 10 }}
        onPress={() => console.log('Trophy pressed')}
      >
        <GamificationIcons.Trophy size={24} />
      </TouchableOpacity>
    </View>
  );
};`}
      />
        <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          Note: PNG icons are image-based, so they handle differently than vector icons.
          The original colors of your PNG files will be preserved, providing a more visually appealing experience.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginTop: 24,
    marginBottom: 12,
  },
  codeBlockContainer: {
    marginBottom: 16,
  },
  codeBlockTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0d6efd',
  },
  code: {
    fontFamily: 'monospace',
    color: '#212529',
  },
  exampleContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  exampleContent: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeInline: {
    fontFamily: 'monospace',
    color: '#212529',
    marginLeft: 16,
    flex: 1,
  },
  groupList: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  groupItem: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 8,
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
  },
});

export default PngIconsUsageSample;
