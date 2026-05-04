const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const parseResponse = async (res, fallbackMessage) => {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`${fallbackMessage} (${res.status})`);
    }
    throw new Error(fallbackMessage || "Invalid response");
  }

  if (!res.ok) {
    throw new Error(data.message || fallbackMessage || "Request failed");
  }

  return data;
};

export const getAllReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews`);
  return parseResponse(res, "Failed to load reviews");
};

export const getReviewById = async (reviewId) => {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`);
  return parseResponse(res, "Failed to load review");
};

function appendPhoto(formData, photoUri) {
  if (!photoUri) return;
  const uri = photoUri;
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const name =
    ext === "png"
      ? "photo.png"
      : ext === "webp"
        ? "photo.webp"
        : "photo.jpg";
  const type =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : "image/jpeg";
  formData.append("photo", { uri, name, type });
}

export const addReview = async ({ name, rating, comment, photo }, token) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("rating", String(rating));
  formData.append("comment", comment);
  appendPhoto(formData, photo);

  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse(res, "Failed to add review");
};

export const updateReview = async (
  reviewId,
  { name, rating, comment, photo },
  token
) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("rating", String(rating));
  formData.append("comment", comment);
  appendPhoto(formData, photo);

  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse(res, "Failed to update review");
};

export const deleteReview = async (reviewId, token) => {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(res, "Failed to delete review");
};
