import {
  Instagram,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';

import { loja } from '../data/loja';

export function Footer() {
  return (
    <footer className="footer footer-novo">
      {/* Benefícios exibidos antes do rodapé */}
      <div className="container footer-destaques">
        <span>
          <Zap /> Tecnologia e praticidade
        </span>
        <span>
          <ShieldCheck /> Qualidade em acessórios
        </span>
        <span>
          <Truck /> Atendimento rápido
        </span>
        <span>
          <MessageCircle /> Compra pelo WhatsApp
        </span>
      </div>

      <div className="container footer-grid">
        <div>
          <h3 className="rodape-logo">
            LLV <span>CONNECT</span>
          </h3>
          <p>
            Mais que acessórios, conexões para o seu dia a dia.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <p>Capinhas · Películas · Carregadores</p>
          <p>Fones · Cabos · Acessórios</p>
        </div>

        <div>
          <h4>Fale com a LLV Connect</h4>

          <a
            href={loja.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={17} /> @llvconnect
          </a>

          {loja.whatsapp ? (
            <a
              href={`https://wa.me/${loja.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={17} />
              WhatsApp
            </a>
          ) : (
            <p>
              <MessageCircle size={17} />
              WhatsApp a configurar
            </p>
          )}

          {loja.endereco && (
            <p>
              <MapPin size={17} />
              {loja.mapa ? (
                <a
                  href={loja.mapa}
                  target="_blank"
                  rel="noreferrer"
                >
                  {loja.endereco}
                </a>
              ) : (
                loja.endereco
              )}
            </p>
          )}
        </div>
      </div>

      <div className="container footer-bottom">
        © {new Date().getFullYear()} LLV Connect.
        Produtos e valores demonstrativos até o cadastro oficial.
      </div>
    </footer>
  );
}
