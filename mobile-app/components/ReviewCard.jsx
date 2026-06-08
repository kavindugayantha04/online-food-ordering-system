import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import StarRating from "./StarRating";
import { COLORS } from "../constants/colours";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

function getPhotoUri(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
}

export default function ReviewCard({
  review,
  isOwner = false,
  showAdminDelete = false,
  onEdit,
  onDelete,
}) {
  if (!review) return null;

  const initial = (review.name || "?").trim().charAt(0).toUpperCase();
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const photoUri = getPhotoUri(review.photo);

  const showOwnerActions = isOwner && (onEdit || onDelete);
  const showAdminDel = showAdminDelete && onDelete;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {review.name}
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
      </View>

      <View style={styles.ratingRow}>
        <StarRating
          rating={Number(review.rating) || 0}
          editable={false}
          size={22}
        />
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : null}

      {(showOwnerActions || showAdminDel) ? (
        <View style={styles.actions}>
          {showOwnerActions && onEdit ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(review)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
          {(showOwnerActions && onDelete) || showAdminDel ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(review)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  date: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.subtext,
    fontWeight: "600",
  },
  ratingRow: {
    marginTop: 12,
  },
  comment: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    fontWeight: "600",
  },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  editBtn: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  editText: {
    color: COLORS.white,
    fontWeight: "800",
  },
  deleteBtn: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteText: {
    color: COLORS.white,
    fontWeight: "800",
  },
});
