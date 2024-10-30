import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import BlogCard from "./cards/BlogCard";
import { useBlogContext } from "@/context/BlogContext";
import { END_POINTS, showToast } from "@/helper/endpoints";

const Details = ({ setPage, blog }) => {
  const { selectedBlogs } = useBlogContext();

  const fetchBlogsByQrCode = async () => {
    if (!selectedBlogs?.qrCode) {
      showToast("No QrCode.");
      return;
    }

    try {
      // console.log(selectedBlogs);

      const url = END_POINTS.GET_BLOG_BY_QR_KEY(selectedBlogs.qrCode);
      const res = await fetch(url);
      console.log("fetchBlogsByQrCode URL:", url);

      if (!res.ok) {
        const errorData = await res.json();
        showToast(errorData.message || "No Blog found");
        return;
      }

      const data = await res.json();
      if (data.length === 0) {
        showToast("No Contribution found against this QR code.");
        setBlogs([]);
        return;
      }

      console.log(data);
      showToast("Blogs By Qr Code fetched successfully.");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showToast("An error occurred while fetching data.");
    }
  };

  useEffect(() => {
    fetchBlogsByQrCode();
  }, [selectedBlogs]);

  return (
    <View className="flex-1">
      <Header
        text={"Track Your Contribution"}
        desc={
          "See details about where, when and how your contribution has been used"
        }
      />
      <View className="flex-1" style={styles.container}>
        <View>
          <BlogCard
            key={blog._id}
            title={blog?.donorName || ""}
            description={blog?.donorDescription || ""}
            donorDescription={blog?.donorDescription || ""}
            imagePath={blog?.imagePath || ""}
            updatedAt={blog?.updatedAt || ""}
            donorName={blog?.donorName || ""}
            _id={blog?._id || ""}
            // Uncomment the line below to enable onPress functionality
            // onPress={() => setViewBlog(blog._id)}
          />
        </View>

        <View style={styles.card}>
          <TouchableOpacity>
            <Text style={styles.text}>
              View your Contribution on the blockchain
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Blockchain</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setPage("OverView")}
          style={styles.overviewButton}
        >
          <Text style={styles.overviewButtonText}>Blog Overview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 15,
      height: 15,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // For Android
  },
  button: {
    padding: 8,

    borderRadius: 3,
    backgroundColor: "#000",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  overviewButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 3,
    backgroundColor: "#000",
    alignItems: "center",
  },
  overviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    fontSize: 19,
    fontWeight: 800,
    marginBottom: 16,
  },
});

export default Details;
