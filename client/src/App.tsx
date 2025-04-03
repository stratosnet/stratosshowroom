import { Switch, Route } from "wouter";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Videos from "./pages/videos";
import Audios from "./pages/audios";
import Pictures from "./pages/pictures";
import MySpace from "./pages/MySpace";
import SharePage from "./pages/share";
import NotFound from "./pages/not-found";
import VideoDetail from "./pages/VideoDetail";
import { useState } from "react";

function App() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Switch>
          <Route path="/">{() => <Videos />}</Route>
          <Route path="/videos">{() => <Videos />}</Route>
          <Route path="/audios">{() => <Audios />}</Route>
          <Route path="/pictures">{() => <Pictures />}</Route>
          <Route path="/myspace">{() => <MySpace />}</Route>
          <Route path="/share">{() => <SharePage />}</Route>
          <Route path="/video/:fileHash">{() => <VideoDetail />}</Route>
          <Route>{() => <NotFound />}</Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
