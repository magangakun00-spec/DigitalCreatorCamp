import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { useContact } from "@/context/ContactContext";

const FooterSection = () => {
  const currentYear = new Date().getFullYear();
  const { contact } = useContact();

  return (
    <footer className="bg-secondary text-secondary-foreground py-16">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-gradient-hero">DigiMagang</span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Program magang digital marketing dengan sistem komisi. Belajar
              skill, dapat penghasilan!
            </p>
            <div className="flex gap-4">
              <a
                href={contact.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={contact.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Hubungi Kami</h4>
            <div className="space-y-3">
              <a
                href={contact.whatsapp_url}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{contact.phone_display}</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{contact.email}</span>
              </a>
              <a
                href={contact.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>{contact.instagram}</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Link Cepat</h4>
            <div className="space-y-3">
              <a
                href="#"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Tentang Program
              </a>
              <a
                href="#"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Kurikulum
              </a>
              <a
                href="#"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Sistem Komisi
              </a>
              <a
                href="#"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-muted/20 mt-12 pt-8">
          <div className="text-center text-muted-foreground text-sm">
            <p className="mb-4">
              <strong>Disclaimer:</strong> Penghasilan dari komisi bervariasi
              tergantung performa masing-masing peserta. Hasil yang ditampilkan
              adalah contoh dan tidak menjamin hasil yang sama.
            </p>
            <p>
              © {currentYear} DigiMagang. Semua hak dilindungi undang-undang.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
