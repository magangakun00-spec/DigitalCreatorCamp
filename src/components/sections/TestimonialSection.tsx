import { Quote, Star } from "lucide-react";
import { useTestimoni } from "@/context/TestimoniContext";

const TestimonialSection = () => {
  const { getPublishedTestimoni, isLoading } = useTestimoni();
  const testimonials = getPublishedTestimoni();

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-muted">
        <div className="container">
          <div className="text-center">
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Cerita Alumni
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Apa Kata <span className="text-gradient-hero">Mereka?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Dengarkan pengalaman nyata dari peserta magang sebelumnya.
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-primary/20 mb-4" />

                {/* Quote text */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star
                      key={`empty-${i}`}
                      className="w-4 h-4 text-slate-300"
                    />
                  ))}
                </div>

                {/* Earnings badge */}
                {testimonial.earnings && (
                  <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-4 py-2 mb-6">
                    <span className="text-sm text-muted-foreground">
                      Total Komisi:
                    </span>
                    <span className="font-bold text-success">
                      {testimonial.earnings}
                    </span>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">
                      {testimonial.author}
                    </p>
                    {testimonial.program && (
                      <p className="text-muted-foreground text-sm">
                        {testimonial.program}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Belum ada testimoni yang dipublikasikan.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
