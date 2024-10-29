import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToastAndroid, Alert, Platform } from 'react-native';
import { END_POINTS } from "@/helper/endpoints";
// Create the BlogContext
const BlogContext = createContext();

// Helper function for showing toast messages
const showToast = (message) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert(message);
    }
};

// Provider Component
const BlogProvider = ({ children }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBlogs = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = END_POINTS.GET_ALL_LIST_BLOG;
            const res = await fetch(url);
            console.log("Response:", res, "URL:", url);

            if (!res.ok) {
                const errorData = await res.json();
                showToast(errorData.message || "No Blog found");
                setError(errorData.message || "No Blog found");
                return;
            }

            const data = await res.json();
            if (data.length === 0) {
                showToast("No Contribution found against this QR code.");
                setBlogs([]);
                return;
            }

            console.log("Data fetched successfully:", data);
            setBlogs(data);
            showToast("Data fetched successfully.");

        } catch (err) {
            console.error("Failed to fetch data:", err);
            showToast("An error occurred while fetching data.");
            setError("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <BlogContext.Provider value={{ blogs, loading, error, fetchBlogs }}>
            {children}
        </BlogContext.Provider>
    );
};
export default BlogProvider
// Custom Hook to use BlogContext
export const useBlogContext = () => useContext(BlogContext);