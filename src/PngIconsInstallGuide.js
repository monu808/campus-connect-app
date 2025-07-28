// PNG Icons Installation Guide
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NavigationIcons, FormIcons } from './PngIcons';

const StepSection = ({ number, title, description, code, children }) => (
  <View style={styles.stepContainer}>
    <View style={styles.stepHeader}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </View>
    
    <Text style={styles.stepDescription}>{description}</Text>
    
    {code && (
      <View style={styles.codeBlock}>
        <Text style={styles.code}>{code}</Text>
      </View>
    )}
    
    {children && <View style={styles.childrenContainer}>{children}</View>}
  </View>
);

const PngIconsInstallGuide = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PNG Icons Installation Guide</Text>
        <Text style={styles.headerSubtitle}>How to add and use PNG icons in your app</Text>
      </View>
      
      <StepSection 
        number="1"
        title="Create PNG Icons Directory Structure"
        description="First, create a directory structure to organize your PNG icons by category:"
        code={`mkdir -p src/assets/png-icons/chat
mkdir -p src/assets/png-icons/navigation
mkdir -p src/assets/png-icons/matching
mkdir -p src/assets/png-icons/gamification
mkdir -p src/assets/png-icons/notification
mkdir -p src/assets/png-icons/form
mkdir -p src/assets/png-icons/social
mkdir -p src/assets/png-icons/profile`}
      />
      
      <StepSection 
        number="2"
        title="Add PNG Icon Files"
        description="Add your PNG icon files to the corresponding directories. Make sure they are properly sized and follow a consistent naming convention."
      >        <View style={styles.infoBlock}>
          <FormIcons.Skills size={24} />
          <Text style={styles.infoText}>
            Icon files should be PNG format with transparent backgrounds and in their final colors, ideally sized at 24x24, 36x36, or 48x48 pixels.
          </Text>
        </View>
      </StepSection>
      
      <StepSection 
        number="3"
        title="Create PngIcons.js Component"
        description="Create a PngIcons.js file that exports components for each icon category:"
        code={`import React from 'react';
import { Image } from 'react-native';

// Chat Icons
export const ChatIcons = {
  ChatBubble: (props) => <Image 
    source={require('./assets/png-icons/chat/chat-bubble.png')} 
    style={{ 
      width: props.size || 24, 
      height: props.size || 24
    }} 
  />,
  // Add more chat icons...
};

// Navigation Icons
export const NavigationIcons = {
  Back: (props) => <Image 
    source={require('./assets/png-icons/navigation/back.png')} 
    style={{ 
      width: props.size || 24, 
      height: props.size || 24
    }}
  />,
  // Add more navigation icons...
};

// Continue with other icon categories...`}
      />
      
      <StepSection 
        number="4"
        title="Update Imports in Your Components"
        description="Replace vector icon imports with PNG icon imports in your components:"
        code={`// Before:
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// After:
import { NavigationIcons, ChatIcons } from '../PngIcons';

// Before:
<MaterialCommunityIcons name="arrow-left" size={24} color="white" />

// After:
<NavigationIcons.ArrowLeft size={24} />`}
      />
      
      <StepSection 
        number="5"
        title="Testing Your Icons"
        description="Test your PNG icons on multiple devices and platforms to ensure they render correctly."
      >        <View style={styles.infoBlock}>
          <NavigationIcons.Search size={24} />
          <Text style={styles.infoText}>
            Use the PNG Icons Demo screen (access with global.showPngIconsDemo()) to verify that all your icons are displaying correctly with their original colors.
          </Text>
        </View>
      </StepSection>
      
      <View style={styles.noteContainer}>        <Text style={styles.noteTitle}>Advantages of PNG Icons</Text>
        <Text style={styles.noteText}>• No font loading required</Text>
        <Text style={styles.noteText}>• Consistent rendering across platforms</Text>
        <Text style={styles.noteText}>• No issues with font icon rendering bugs</Text>
        <Text style={styles.noteText}>• Support for complex multi-color icons</Text>
        <Text style={styles.noteText}>• Original colors preserved with no tinting</Text>
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
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  stepContainer: {
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  stepDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0d6efd',
  },
  code: {
    fontFamily: 'monospace',
    color: '#212529',
  },
  childrenContainer: {
    marginTop: 12,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e7f1ff',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#0d6efd',
    lineHeight: 20,
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginTop: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default PngIconsInstallGuide;
