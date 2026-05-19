import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BookOpen, ShoppingCart, Download, ExternalLink,
  Quote, ChevronRight, Star
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const Books = ({ user, api }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  const stableBookKey = (prefix, value) => {
    const slug = String(value || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90);
    return `${prefix}-${slug || "item"}`;
  };

  const relatedBooks = useMemo(
    () => books.filter((book) => book.id !== selectedBook?.id),
    [books, selectedBook?.id],
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        setBooks(response.data || []);
        // Auto-select first book if available
        if (response.data?.length > 0) {
          setSelectedBook(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [api]);

  return (
    <div className="min-h-screen bg-background" data-testid="books-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Wisdom</p>
              <h1 className="text-xl font-serif">The <span className="italic text-primary">Book</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Book coming soon!</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Sacred wisdom is being prepared for you.
            </p>
          </div>
        ) : selectedBook ? (
          <div className="grid lg:grid-cols-[350px,1fr] gap-12">
            {/* Book Cover Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
                {selectedBook.cover_image ? (
                  <img 
                    src={selectedBook.cover_image} 
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-white/30" />
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="space-y-3 text-sm">
                {selectedBook.author && (
                  <p><span className="text-muted-foreground">Author:</span> {selectedBook.author}</p>
                )}
                {selectedBook.pages > 0 && (
                  <p><span className="text-muted-foreground">Pages:</span> {selectedBook.pages}</p>
                )}
                {selectedBook.publication_date && (
                  <p><span className="text-muted-foreground">Published:</span> {new Date(selectedBook.publication_date).toLocaleDateString()}</p>
                )}
                {selectedBook.isbn && (
                  <p><span className="text-muted-foreground">ISBN:</span> {selectedBook.isbn}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {selectedBook.price > 0 && (
                  <div className="text-center">
                    <span className="text-3xl font-serif text-primary">${selectedBook.price}</span>
                  </div>
                )}
                
                {selectedBook.purchase_link && (
                  <Button 
                    className="w-full bg-primary"
                    onClick={() => window.open(selectedBook.purchase_link, "_blank")}
                    data-testid="purchase-btn"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase Book
                  </Button>
                )}
                
                {selectedBook.sample_pdf && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedBook.sample_pdf, "_blank")}
                    data-testid="sample-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Book Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-serif mb-2">{selectedBook.title}</h1>
                {selectedBook.subtitle && (
                  <p className="text-xl text-muted-foreground italic">{selectedBook.subtitle}</p>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                  {selectedBook.description}
                </p>
              </div>

              {/* Chapters Preview */}
              {selectedBook.chapters?.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Table of Contents
                  </h3>
                  <div className="space-y-2">
                    {selectedBook.chapters.map((chapter, index) => (
                      <div 
                        key={stableBookKey(`chapter-${selectedBook.id}`, chapter.id || chapter.title || chapter.number || index + 1)}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-primary font-medium">Chapter {chapter.number || index + 1}</span>
                            <h4 className="font-medium">{chapter.title}</h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {chapter.preview && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {chapter.preview}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials */}
              {selectedBook.testimonials?.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    What Readers Say
                  </h3>
                  <div className="space-y-4">
                    {selectedBook.testimonials.map((testimonial) => (
                      <Card key={stableBookKey(`testimonial-${selectedBook.id}`, testimonial.name || testimonial.quote)} className="bg-white/5 border-white/10">
                        <CardContent className="p-6">
                          <Quote className="w-8 h-8 text-primary/30 mb-3" />
                          <p className="italic text-muted-foreground mb-4">
                            "{testimonial.quote}"
                          </p>
                          <p className="font-medium text-sm">— {testimonial.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : null}

        {/* Multiple Books List (if more than one) */}
        {books.length > 1 && (
          <div className="mt-16">
            <h3 className="text-xl font-serif mb-6">More Books</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((book) => (
                <motion.div
                  key={book.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedBook(book)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                  </div>
                  <h4 className="mt-2 font-medium text-sm line-clamp-1">{book.title}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Books;
