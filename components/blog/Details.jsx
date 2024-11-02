import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import BlogCard from "./cards/BlogCard";
import { useBlogContext } from "@/context/BlogContext";
import { END_POINTS, showToast } from "@/helper/endpoints";
import * as WebBrowser from "expo-web-browser";
import { getValueFor, save } from "@/lib/SecureStore";
import { Ionicons } from "@expo/vector-icons";

const BLOG_IDS_KEY = "openedBlogIds";

const saveBlogId = async (blogId) => {
  try {
    const existingIds = await getValueFor(BLOG_IDS_KEY);
    const blogIdsArray = existingIds ? JSON.parse(existingIds) : [];
    if (!blogIdsArray.includes(blogId)) {
      blogIdsArray.push(blogId);
    }
    await save(BLOG_IDS_KEY, JSON.stringify(blogIdsArray));
  } catch (error) {
    console.error("Error saving blog ID:", error);
  }
};

const Details = ({ setPage }) => {
  const { selectedBlog, viewBlog, setViewBlog, loading } = useBlogContext();
  const [qrBlog, setQrBlog] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const qrCode = selectedBlog?.qrCode;

  const fetchBlogsByQrCode = async () => {
    if (!qrCode) {
      showToast("No QR Code.");
      return;
    }

    setIsFetching(true);
    try {
      const url = END_POINTS.GET_BLOG_BY_QR_KEY({ qrCode });
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        showToast("Failed to fetch data: " + errorData.message);
        return;
      }
      const data = await res.json();
      if (data.data.length === 0) {
        showToast("No Contribution found against this QR code.");
        setQrBlog([]);
        return;
      }
      setQrBlog(data.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showToast("An error occurred while fetching data.");
    } finally {
      setIsFetching(false);
    }
  };

  const _handlePressButtonAsync = async () => {
    if (qrBlog?.[0]?.tokenTranHash) {
      await WebBrowser.openBrowserAsync(qrBlog[0].tokenTranHash);
    } else {
      showToast("No blockchain link available.");
    }
  };

  useEffect(() => {
    if (!loading && selectedBlog?._id) {
      saveBlogId(selectedBlog._id);
    }
    if (!loading) {
      fetchBlogsByQrCode();
    }
  }, [selectedBlog, loading]);

  return (
    <View style={styles.container}>
      <Header
        text="Track Your Contribution"
        desc="See details about where, when and how your contribution has been used"
      />
      <View style={styles.contentContainer}>
        {isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B5563" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View>
              {qrBlog.length > 0 && (
                <BlogCard
                  key={qrBlog[0]._id}
                  title={qrBlog[0].charityName}
                  description={qrBlog[0].description}
                  donorDescription={`YNT ${qrBlog[0]?.token}`}
                  donorName={qrBlog[0]?.location}
                  updatedAtStr={qrBlog[0].fundsReceivingDate}
                  imagePath={"charity" + qrBlog[0].charityBanner}
                  onPress={() => console.log(qrBlog[0]._id)}
                />
              )}

              <View style={styles.card}>
                <TouchableOpacity>
                  <View style={styles.contributorContainer}>
                    <Text style={styles.contributorText}>Contributor</Text>
                    <Text style={styles.text}>Y</Text>
                  </View>
                  <Text style={styles.textSmall}>
                    About Contributor: Y wanted to help children and families
                    affected by the lockdown
                  </Text>
                </TouchableOpacity>
              </View>
                <View>
                  <TouchableOpacity style={{ marginTop: 10 }}>
                    <Text style={styles.text}>
                      View your Contribution on the blockchain
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.blockchainButton}
                    onPress={_handlePressButtonAsync}
                  >
                    <Text style={styles.buttonText}>View Blockchain</Text>
                  </TouchableOpacity>
                </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => setPage("AllBlogs")}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPage("Read")}
                  style={styles.readBlogButton}
                >
                  <View style={styles.readBlogContent}>
                    <Ionicons
                      name="reader-outline"
                      size={20}
                      color="white"
                      style={styles.bookIcon}
                    />
                    <Text style={styles.buttonText}>Read Complete Blog</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blockchainButton: {
    padding: 10,
    backgroundColor: "#000",
    alignItems: "center",
    borderRadius: 2,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  backButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 2,
    alignItems: "center",
  },
  readBlogButton: {
    backgroundColor: "#000",
    flex: 1,
    marginLeft: 4,
    padding: 12,
    borderRadius: 2,
  },
  readBlogContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bookIcon: {
    marginRight: 8,
  },
  contributorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contributorText: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    fontSize: 14,
    color: "#666",
  },
  textSmall: {
    fontSize: 14,
    color: "#4B5563",
  },
});

export default Details;
