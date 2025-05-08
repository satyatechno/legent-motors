import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons, AntDesign} from 'src/utils/icon';
import {getWishlist, removeFromWishlist} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useWishlist} from '../context/WishlistContext';
import {COLORS, SPACING, FONT_SIZES} from '../utils/constants';
import {CarImage} from '../components/common';

// Car card component for wishlist items
const WishlistCarCard = ({car, onPress, onRemove, isRemoving = false}) => {
  // Extract data from the car object
  const brandName = car.Brand?.name || car.brand || '';
  const modelName = car.CarModel?.name || car.model || '';
  const year = car.Year?.year || car.year || '';
  const price =
    car.price ||
    (car.CarPrices && car.CarPrices.length > 0 ? car.CarPrices[0].price : 0);
  const category = car.Tags && car.Tags.length > 0 ? car.Tags[0].name : '';
  const additionalInfo = car.additionalInfo || '';

  // Determine if car is in wishlist
  const carId = car.carId || car.id;
  const inWishlist = true; // Always true in the wishlist screen

  // Debug car data structure
  console.log(
    `WishlistCard for car: ${brandName} ${modelName}, carId: ${carId}, id: ${
      car.id
    }, wishlistId: ${car.wishlistId || 'N/A'}`,
  );

  // Function to toggle wishlist status
  const toggleWishlist = async () => {
    try {
      // Prevent action if item is already being removed
      if (isRemoving) {
        console.log(
          `Item is already being removed, skipping duplicate request`,
        );
        return;
      }

      // Always use the car ID for removal, not the wishlist ID
      const carId = car.carId || car.id;
      console.log(`Card requesting removal of car ID ${carId}`);

      // Only use the parent's onRemove function, not the context directly
      onRemove(carId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Get the first image URL if available
  const imageUrl =
    car.CarImages && car.CarImages.length > 0 && car.CarImages[0].FileSystem
      ? {
          uri: `https://cdn.legendmotorsglobal.com${
            car.CarImages[0].FileSystem.thumbnailPath ||
            car.CarImages[0].FileSystem.compressedPath
          }`,
        }
      : require('../components/home/HotDealsCar.png');

  return (
    <TouchableOpacity style={styles.carCard} onPress={() => onPress(car)}>
      <View style={styles.cardBorder}>
        <View style={styles.imageContainer}>
          <CarImage
            source={imageUrl}
            style={styles.carImage}
            resizeMode="cover"
          />
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.carTitle}>
            {`${year} ${brandName} ${modelName}`.trim()}
          </Text>
          {additionalInfo && (
            <Text style={styles.additionalInfo}>{additionalInfo}</Text>
          )}
          <Text style={styles.priceText}>$ {price.toLocaleString()}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={toggleWishlist}
              disabled={isRemoving}>
              {isRemoving ? (
                <ActivityIndicator size="small" color="#FF8C00" />
              ) : inWishlist ? (
                <AntDesign name="heart" size={24} color="#FF8C00" />
              ) : (
                <AntDesign name="hearto" size={24} color="#FF8C00" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={24} color="#777" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyWishlistScreen = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingItems, setRemovingItems] = useState({}); // Track items being removed
  const navigation = useNavigation();
  const {user} = useAuth();
  const {removeItemFromWishlist, fetchWishlistItems: contextFetchWishlist} =
    useWishlist();

  // Fetch wishlist data
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();

      // Debug the response structure
      console.log('Wishlist response structure:', JSON.stringify(response));

      if (response.success && Array.isArray(response.data)) {
        console.log(`Fetched ${response.data.length} wishlist items`);

        // Process wishlist items to ensure they have the right format for rendering
        const processedItems = response.data.map(item => {
          // If the item has a car property, use it as the base and add necessary fields
          if (item.car) {
            return {
              ...item.car,
              wishlistId: item.id,
              carId: item.carId,
              userId: item.userId,
              inWishlist: true, // Always true since we're in the wishlist screen
            };
          }
          // Otherwise, return the item as is with wishlist flag
          return {
            ...item,
            inWishlist: true,
          };
        });

        console.log(
          'Processed wishlist items:',
          JSON.stringify(processedItems),
        );
        setWishlistItems(processedItems);
      } else {
        console.log('No wishlist items found or error in response');
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
      Alert.alert('Error', 'Failed to load wishlist items. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load wishlist on component mount
  useEffect(() => {
    fetchWishlist();
    // Also refresh the context wishlist for other components
    contextFetchWishlist();
  }, []);

  // Remove item from wishlist
  const handleRemoveFromWishlist = async itemId => {
    try {
      // Check if this item is already being removed
      if (removingItems[itemId]) {
        console.log(
          `Item ${itemId} is already being removed, skipping duplicate request`,
        );
        return;
      }

      console.log(`Attempting to remove car ID ${itemId} from wishlist`);

      // Mark this item as being removed
      setRemovingItems(prev => ({...prev, [itemId]: true}));

      // Show loading indicator
      setLoading(true);

      // Use carId for API call as required by the API
      const success = await removeItemFromWishlist(itemId);

      if (success) {
        console.log(`Successfully removed car ID ${itemId} from wishlist`);

        // Remove from local state for immediate UI update
        setWishlistItems(prevItems => {
          return prevItems.filter(item => {
            // Check all possible ID matches
            return item.id !== itemId && item.carId !== itemId;
          });
        });
      } else {
        console.error(`Failed to remove car ID ${itemId} from wishlist`);
        Alert.alert('Error', 'Failed to remove car from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert(
        'Error',
        'Failed to remove car from wishlist. Please try again.',
      );
    } finally {
      setLoading(false);
      // Clear the removing state for this item
      setRemovingItems(prev => {
        const updated = {...prev};
        delete updated[itemId];
        return updated;
      });
    }
  };

  // Navigate to car details
  const navigateToCarDetail = car => {
    navigation.navigate('CarDetailScreen', {carId: car.id});
  };

  // Pull to refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtext}>Cars you love will appear here</Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Main')}>
        <Text style={styles.exploreButtonText}>Explore Cars</Text>
      </TouchableOpacity>
    </View>
  );

  // For the WishlistCarCard, update to use this:
  const renderWishlistCarCard = ({item}) => (
    <WishlistCarCard
      car={item}
      onPress={navigateToCarDetail}
      onRemove={handleRemoveFromWishlist}
      isRemoving={!!removingItems[item.id] || !!removingItems[item.carId]}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={COLORS.primary}
        />
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistCarCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCard: {
    marginBottom: SPACING.lg,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    padding: 15,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heartButton: {
    marginHorizontal: 10,
  },
  shareButton: {
    marginHorizontal: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: 100,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMedium,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
    marginTop: SPACING.lg,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
});

export default MyWishlistScreen;
