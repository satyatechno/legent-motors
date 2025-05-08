import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import CheckboxItem from './CheckboxItem';
import {Ionicons} from 'src/utils/icon';

const FilterContent = ({
  title,
  data = [],
  loading = false,
  emptyMessage = 'No options available',
  selectedItems = [],
  onSelectItem,
  onRetry,
  infoText = '',
  itemType = 'default', // 'default', 'color', 'bodyType', 'seats', etc.
  headerText = '',
}) => {
  // Generate appropriate icon based on item type
  const getIcon = (item, type) => {
    if (type === 'bodyType') {
      let iconName = 'car-outline';
      if (item.name.toLowerCase().includes('suv')) iconName = 'car-sport';
      else if (item.name.toLowerCase().includes('van'))
        iconName = 'car-sport-outline';
      else if (item.name.toLowerCase().includes('pickup'))
        iconName = 'cube-outline';

      return (
        <Ionicons
          name={iconName}
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    } else if (type === 'steeringSide') {
      return (
        <Ionicons
          name={item.name.toLowerCase().includes('right') ? 'car' : 'car-sport'}
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    } else if (type === 'seats') {
      return (
        <Ionicons
          name="people-outline"
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    } else if (type === 'doors') {
      return (
        <Ionicons
          name="exit-outline"
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    } else if (type === 'fuelType') {
      let iconName = 'flame-outline';
      if (item.name.toLowerCase().includes('electric'))
        iconName = 'flash-outline';
      else if (item.name.toLowerCase().includes('hybrid'))
        iconName = 'battery-charging-outline';

      return (
        <Ionicons
          name={iconName}
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    } else if (type === 'cylinders') {
      let iconName = 'hardware-chip-outline';
      if (item.name.toLowerCase().includes('electric'))
        iconName = 'flash-outline';

      return (
        <Ionicons
          name={iconName}
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    } else if (type === 'wheelSize') {
      return (
        <Ionicons
          name="disc-outline"
          size={20}
          color="#666666"
          style={{marginRight: 10}}
        />
      );
    }

    return null;
  };

  // Generate color indicator for color type
  const getColorIndicator = (item, type) => {
    if (type === 'color' || type === 'interiorColor') {
      const colorMap = {
        Black: '#000000',
        White: '#FFFFFF',
        Grey: '#808080',
        Red: '#FF0000',
        Blue: '#0000FF',
        Green: '#008000',
        Yellow: '#FFFF00',
        Brown: '#A52A2A',
        Beige: '#F5F5DC',
        Maroon: '#800000',
        Tan: '#D2B48C',
        Ivory: '#FFFFF0',
        Cream: '#FFFDD0',
        Silver: '#C0C0C0',
        Gold: '#FFD700',
        Orange: '#FFA500',
        Purple: '#800080',
      };

      return colorMap[item.name] || '#CCCCCC';
    }

    return null;
  };

  // Get custom style based on item type
  const getCustomStyle = type => {
    switch (type) {
      case 'regionalSpec':
        return styles.regionalSpecItem;
      case 'steeringSide':
        return styles.steeringSideItem;
      case 'color':
        return styles.colorItem;
      case 'interiorColor':
        return styles.colorItem;
      case 'wheelSize':
        return styles.wheelSizeItem;
      case 'bodyType':
        return styles.bodyTypeItem;
      case 'seats':
        return styles.seatsItem;
      case 'doors':
        return styles.doorsItem;
      case 'fuelType':
        return styles.fuelTypeItem;
      case 'cylinders':
        return styles.cylindersItem;
      default:
        return {};
    }
  };

  // Render each item based on its type
  const renderItem = ({item}) => (
    <CheckboxItem
      label={item.name || item.year || ''}
      isSelected={selectedItems.includes(item.name || item.year || '')}
      onSelect={() => onSelectItem(item)}
      icon={getIcon(item, itemType)}
      colorIndicator={getColorIndicator(item, itemType)}
      status={item.status}
      customStyle={getCustomStyle(itemType)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F47B20" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.filterContent}>
      <Text style={styles.filterTitle}>{title}</Text>

      {infoText && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{infoText}</Text>
        </View>
      )}

      {data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={item => String(item.id || item.year || item.name)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            headerText ? (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{headerText}</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.reloadButton} onPress={onRetry}>
              <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 32,
  },
  reloadButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  infoContainer: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 3,
    borderLeftColor: '#F47B20',
    borderRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  regionalSpecItem: {
    backgroundColor: '#F8F8F8',
  },
  steeringSideItem: {
    backgroundColor: '#F0F5FF',
  },
  colorItem: {
    backgroundColor: '#FFF0F5',
  },
  wheelSizeItem: {
    backgroundColor: '#FFF5EE',
  },
  bodyTypeItem: {
    backgroundColor: '#FFF5F5',
  },
  seatsItem: {
    backgroundColor: '#FFF5FF',
  },
  doorsItem: {
    backgroundColor: '#FFF5FF',
  },
  fuelTypeItem: {
    backgroundColor: '#FFFAED',
  },
  cylindersItem: {
    backgroundColor: '#F0FFF0',
  },
});

export default FilterContent;
