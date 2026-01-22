import { Inter, Roboto_Mono } from 'next/font/google';
import "./globals.css";
import Layout from "../components/Layout";

const inter = Inter({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "ஸ்ரீ தேவி பூதேவி சமேத ஸ்ரீ வரதராஜப் பெருமாள் திருக்கோவில் - செட்டிகுறிச்சி, திருநெல்வேலி",
    description: "ஸ்ரீ தேவி பூதேவி சமேத ஸ்ரீ வரதராஜப் பெருமாள் திருக்கோவில் அதிகாரப்பூர்வ இணையதளம்",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ta" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${robotoMono.variable} antialiased`}
            >
                <Layout>
                    {children}
                </Layout>
            </body>
        </html>
    );
}
