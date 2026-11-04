import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Server, Layers } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-retail-dark text-gray-400 text-sm mt-20 border-t border-slate-800">
      {/* DevOps Architecture Showcase Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Server size={18} />
            </div>
            <div>
              <p className="font-semibold text-white">Monolith Architecture</p>
              <p className="text-gray-400 text-[11px]">Node.js &bull; Express &bull; Prisma ORM</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers size={18} />
            </div>
            <div>
              <p className="font-semibold text-white">Cloud Migration Target</p>
              <p className="text-gray-400 text-[11px]">AWS VPC &bull; EC2 &bull; RDS Postgres</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-semibold text-white">Zero-Downtime Releases</p>
              <p className="text-gray-400 text-[11px]">Nginx Blue-Green &bull; Health Checks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity size={18} />
            </div>
            <div>
              <p className="font-semibold text-white">Live Observability</p>
              <p className="text-gray-400 text-[11px]">Prometheus &bull; Grafana Metrics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-retail-accent text-white font-bold flex items-center justify-center text-base">
                R
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Retail<span className="text-retail-accent">Max</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enterprise-grade modern e-commerce platform designed for automated cloud migration, high availability, and zero-downtime deployments.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="hover:text-white transition-colors">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link to="/products?category=apparel" className="hover:text-white transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-living" className="hover:text-white transition-colors">
                  Home & Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Customer Area
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* System & DevOps Telemetry */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              DevOps Endpoints
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/health"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  API Health Status (/health)
                </a>
              </li>
              <li>
                <a
                  href="/metrics"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Prometheus Telemetry (/metrics)
                </a>
              </li>
              <li>
                <span className="text-gray-500">CI/CD: Jenkins Pipeline Automation</span>
              </li>
              <li>
                <span className="text-gray-500">IaC: Terraform &bull; Config: Ansible</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} RetailMax Platform. SRM University Cloud Migration Project.</p>
          <p>Engineered with React, Tailwind CSS, Express, Prisma & AWS Cloud Tools.</p>
        </div>
      </div>
    </footer>
  );
};
