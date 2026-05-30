/* ═══════════════════════════════════════════════════════════
   SPECSOLID SEARCH SYSTEM v1.0
   Google-style intelligent search + Voice + Interview Assistant
   License: MIT | No external dependencies | ~42KB unminified
   ═══════════════════════════════════════════════════════════ */
(function (w, d) {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────────── */
  var cfg = Object.assign({
    site: 'specsolid',
    lang: 'es',
    topics: [],
    apiTimeout: 6000,
    maxLocal: 7,
    debounceMs: 320,
    voiceAutoSubmit: true,
    voiceAutoSubmitDelay: 1200,
    hostedBase: 'https://www.specsolid.com',
  }, w.SpecSearch || {});

  /* ── SITE CONTENT INDEX ───────────────────────────────── */
  var PAGES = [
    /* SpecSolid */
    { title: 'SpecSolid — Herramientas', url: 'https://www.specsolid.com/tools/', tags: ['tools','herramientas','alpaquitay','manancanchu','scrum','spec','devops','kanban'] },
    { title: 'SpecSolid — Architecture', url: 'https://www.specsolid.com/architecture/', tags: ['architecture','arquitectura','patterns','solid','design'] },
    { title: 'SpecSolid — Philosophy', url: 'https://www.specsolid.com/philosophy/', tags: ['philosophy','filosofia','spec-driven','sdd','principios'] },
    { title: 'SpecSolid — Open Source', url: 'https://www.specsolid.com/opensource/', tags: ['open source','github','codigo abierto','contribuir'] },
    { title: 'SpecSolid — Support', url: 'https://www.specsolid.com/support/', tags: ['support','soporte','help','ayuda','contacto'] },
    /* DevOps */
    { title: 'DevOps — Linux Foundations', url: 'https://devops.specsolid.com/foundations/', tags: ['linux','bash','shell','terminal','fundamentos','permisos','systemd'] },
    { title: 'DevOps — Cloud (AWS/GCP/Azure)', url: 'https://devops.specsolid.com/cloud/', tags: ['cloud','aws','gcp','azure','ec2','s3','vpc','iam','nube'] },
    { title: 'DevOps — CI/CD Pipelines', url: 'https://devops.specsolid.com/cicd/', tags: ['cicd','github actions','jenkins','gitlab ci','pipeline','continuous integration'] },
    { title: 'DevOps — Containers & Docker', url: 'https://devops.specsolid.com/containers/', tags: ['docker','kubernetes','k8s','containers','contenedores','helm','pod'] },
    { title: 'DevOps — Infrastructure as Code', url: 'https://devops.specsolid.com/iac/', tags: ['terraform','ansible','pulumi','iac','infrastructure','hcl'] },
    { title: 'DevOps — Monitoring & Observability', url: 'https://devops.specsolid.com/monitoring/', tags: ['prometheus','grafana','loki','monitoring','monitoreo','alerting','sre'] },
    { title: 'DevOps — Advanced Topics', url: 'https://devops.specsolid.com/advanced/', tags: ['advanced','senior','architecture','avanzado','microservices'] },
    { title: 'DevOps — Interview Preparation', url: 'https://devops.specsolid.com/interview/', tags: ['interview','entrevista','preguntas','devops interview','prep'] },
    { title: 'DevOps — Experience & Projects', url: 'https://devops.specsolid.com/experience/', tags: ['experience','experiencia','projects','proyectos','portfolio'] },
    { title: 'DevOps — Compliance: ISO 27001 / GDPR / PCI-DSS', url: 'https://devops.specsolid.com/compliance/', tags: ['compliance','iso27001','gdpr','pci-dss','soc2','bian','togaf','seguridad'] },
    /* Scrum */
    { title: 'Scrum Board SDD', url: 'https://scrum.specsolid.com/', tags: ['scrum','board','kanban','sprint','backlog','task'] },
    { title: 'Scrum — Backlog', url: 'https://scrum.specsolid.com/backlog/', tags: ['backlog','product backlog','user story','historia de usuario'] },
    { title: 'Scrum — Planning', url: 'https://scrum.specsolid.com/planning/', tags: ['planning','sprint planning','story points','velocity','estimacion'] },
    { title: 'Scrum — Métricas', url: 'https://scrum.specsolid.com/metricas/', tags: ['metricas','metrics','velocity','burndown','charts'] },
    /* Spec */
    { title: 'SDD — Framework Teórico', url: 'https://ai.specsolid.com/', tags: ['spec-driven','sdd','specification','especificacion','framework'] },
    { title: 'SDD — Flujo', url: 'https://ai.specsolid.com/flujo/', tags: ['flujo','workflow','sdd flow','proceso'] },
    { title: 'SDD — Anatomía SPEC', url: 'https://ai.specsolid.com/spec/', tags: ['spec anatomy','anatomia spec','spec.md','formato'] },
    { title: 'SDD — ADR (Architecture Decision Records)', url: 'https://ai.specsolid.com/adr/', tags: ['adr','architecture decision','decision records','registro'] },
    { title: 'SDD — Modelos IA', url: 'https://ai.specsolid.com/modelos/', tags: ['ai models','modelos ia','llm','gpt','claude','machine learning'] },
    { title: 'SDD — Simulador', url: 'https://ai.specsolid.com/sim/', tags: ['simulator','simulador','demo','prueba'] },
    { title: 'SDD — Riesgos', url: 'https://ai.specsolid.com/riesgos/', tags: ['riesgos','risks','risk management','gestion'] },
    /* Alpaquitay AI */
    { title: 'Alpaquitay AI — VS Code Extension', url: 'https://alpaquitay-ai.specsolid.com/', tags: ['alpaquitay','vscode','extension','ai','coding assistant','llm','claude'] },
    /* Manancanchu AI */
    { title: 'Manancanchu AI — VS Code Extension', url: 'https://manan-kanchu-code-ai.specsolid.com/', tags: ['manancanchu','vscode','extension','ai','security','vulnerability','code detection','malware','ai detector'] },
  ];

  /* ── KNOWLEDGE BASE (Interview + Search topics) ───────── */
  var KB = {
    kubernetes: {
      title: 'Kubernetes',
      tags: ['kubernetes','k8s','pod','cluster','kubectl','deployment','container','scaling','helm','namespace','rbac','hpa','vpa','ingress'],
      def_en: 'Open-source container orchestration system that automates deployment, scaling, and management of containerized applications.',
      def_es: 'Sistema de orquestación de contenedores que automatiza el despliegue, escalado y gestión de aplicaciones en contenedores.',
      pronunciation: 'koo-ber-NET-eez',
      commands: [
        'kubectl get pods -A                          # List all pods',
        'kubectl describe pod <name> -n <ns>          # Pod details + events',
        'kubectl logs <pod> -f --tail=100             # Follow logs',
        'kubectl scale deploy/<name> --replicas=5     # Scale deployment',
        'kubectl apply -f deployment.yaml             # Apply config',
        'kubectl rollout status deploy/<name>         # Check rollout',
        'kubectl exec -it <pod> -- /bin/bash          # Shell into pod',
        'helm upgrade --install <r> <chart> -n <ns>  # Helm deploy',
      ],
      tips: [
        'HPA (Horizontal Pod Autoscaler) scales based on CPU/memory or custom metrics',
        'Liveness probe = is app alive? Readiness probe = is app ready to serve traffic?',
        'Rolling update = zero-downtime; Blue/Green = instant full switch',
        'Namespaces isolate resources; RBAC controls who can access what',
        'etcd is the distributed key-value store — brain of the cluster',
        'Resource requests vs limits: requests for scheduling, limits for capping',
      ],
      response_en: 'I\'ve managed production Kubernetes clusters, implementing HPA for auto-scaling based on CPU/memory and custom Prometheus metrics. I follow GitOps with ArgoCD, configure liveness and readiness probes for zero-downtime deployments, and use RBAC with least-privilege principles.',
      response_es: 'He gestionado clústeres Kubernetes en producción, implementando HPA para auto-escalado y GitOps con ArgoCD. Configuro probes de liveness y readiness para despliegues sin downtime, y uso RBAC con principio de mínimo privilegio.',
      related: ['docker', 'terraform', 'cicd', 'monitoring'],
      url: 'https://devops.specsolid.com/containers/',
    },
    docker: {
      title: 'Docker',
      tags: ['docker','container','dockerfile','image','registry','compose','containerization','buildkit'],
      def_en: 'Platform for building, shipping, and running applications in isolated, lightweight containers.',
      def_es: 'Plataforma para construir, distribuir y ejecutar aplicaciones en contenedores aislados y ligeros.',
      pronunciation: 'DOK-er',
      commands: [
        'docker build -t myapp:v1 --no-cache .        # Build image',
        'docker run -d -p 8080:80 --name app myapp:v1 # Run container',
        'docker ps && docker logs app -f              # Status & logs',
        'docker exec -it app /bin/sh                  # Shell access',
        'docker-compose up -d --build                 # Compose stack up',
        'docker system prune -af --volumes            # Clean up all',
        'docker push registry.io/myapp:v1             # Push to registry',
        'docker inspect app | jq .[0].NetworkSettings # Network info',
      ],
      tips: [
        'Multi-stage builds: build stage (heavy) → runtime stage (lean)',
        '.dockerignore: exclude node_modules, .git, *.log to speed builds',
        'Run as non-root user — security best practice in every Dockerfile',
        'Layer caching: COPY package.json before COPY . for faster rebuilds',
        'Scan images with Trivy or Snyk before pushing to registry',
      ],
      response_en: 'I write production Dockerfiles with multi-stage builds, reducing image sizes by 80%+ (e.g., 800MB → 120MB for Node.js). I implement security practices: non-root user, read-only filesystem, Trivy scanning in CI/CD, and sign images with Docker Content Trust.',
      response_es: 'Escribo Dockerfiles de producción con builds multi-etapa, reduciendo tamaños de imagen en 80%+. Implemento prácticas de seguridad: usuario no-root, filesystem de solo lectura, escaneo Trivy en CI/CD y firmado de imágenes.',
      related: ['kubernetes', 'cicd', 'terraform'],
      url: 'https://devops.specsolid.com/containers/',
    },
    terraform: {
      title: 'Terraform',
      tags: ['terraform','iac','infrastructure','hcl','state','plan','apply','modules','provider','tfvars','workspace'],
      def_en: 'HashiCorp Infrastructure as Code tool for provisioning and managing cloud resources declaratively using HCL.',
      def_es: 'Herramienta de Infraestructura como Código de HashiCorp para aprovisionar y gestionar recursos cloud de forma declarativa usando HCL.',
      pronunciation: 'TER-ah-form',
      commands: [
        'terraform init -upgrade                   # Initialize + update providers',
        'terraform plan -out=tfplan -var-file=prod.tfvars  # Preview changes',
        'terraform apply tfplan                    # Apply planned changes',
        'terraform destroy -target=module.vpc      # Destroy specific resource',
        'terraform state list && terraform state show <res>  # Inspect state',
        'terraform fmt -recursive && terraform validate    # Lint + validate',
        'terraform workspace new staging           # Create environment workspace',
        'terraform import aws_instance.web i-1234  # Import existing resource',
      ],
      tips: [
        'Remote state: S3 bucket + DynamoDB table for locking (never local in team)',
        'Modules = reusable infrastructure components; version-pin them',
        'Always review `terraform plan` output before applying — no surprises',
        'Separate state per environment: dev, staging, prod workspaces or directories',
        'Use `moved` blocks instead of destroy+recreate when refactoring',
      ],
      response_en: 'I architect Terraform with modular design — separate modules for VPC, compute, databases, and security. Remote state in S3 with DynamoDB locking, environment separation via workspaces, and all changes go through a CI pipeline that runs `terraform plan` for PR review before `apply`.',
      response_es: 'Diseño Terraform con arquitectura modular — módulos separados para VPC, cómputo, bases de datos y seguridad. Estado remoto en S3 con locking DynamoDB, separación de entornos via workspaces, y todos los cambios pasan por CI que ejecuta `terraform plan` en la PR antes del `apply`.',
      related: ['kubernetes', 'cicd', 'cloud'],
      url: 'https://devops.specsolid.com/iac/',
    },
    cicd: {
      title: 'CI/CD Pipelines',
      tags: ['cicd','ci','cd','pipeline','github actions','jenkins','gitlab ci','continuous integration','deployment','automation'],
      def_en: 'Automated delivery practice: CI validates code on every commit (tests, linting, scanning); CD deploys validated code to production automatically.',
      def_es: 'Práctica de entrega automatizada: CI valida código en cada commit (tests, linting, escaneo); CD despliega código validado a producción automáticamente.',
      pronunciation: 'SEE-eye SEE-dee',
      commands: [
        '# GitHub Actions — core structure',
        'on: [push, pull_request]',
        'jobs: lint → test → build → scan → deploy',
        '# Cache dependencies',
        'uses: actions/cache@v4 path: ~/.npm',
        '# Docker build + push',
        'docker build -t $IMAGE:$GITHUB_SHA .',
        '# Kubernetes rolling deploy',
        'kubectl set image deploy/app app=$IMAGE:$SHA',
        '# Rollback on failure',
        'kubectl rollout undo deployment/app',
      ],
      tips: [
        'Fail fast: lint → unit tests → integration → security → deploy in order',
        'Cache: node_modules, .m2, pip, Gradle — 10x faster pipelines',
        'Secrets never in code — use GitHub Secrets, Vault, AWS Secrets Manager',
        'Rollback strategy is as important as deployment — test it regularly',
        'Branch strategy: feature → dev → staging → main (never direct to main)',
      ],
      response_en: 'I design CI/CD pipelines with GitHub Actions and GitLab CI, following fail-fast ordering: lint → test with coverage → container scanning (Trivy) → build → deploy. I implement semantic versioning, automated rollback on failed health checks, and environment promotion gates.',
      response_es: 'Diseño pipelines CI/CD con GitHub Actions y GitLab CI, siguiendo fail-fast: lint → tests con coverage → escaneo de contenedores → build → deploy. Implemento versionado semántico, rollback automático en health checks fallidos y gates de promoción entre entornos.',
      related: ['docker', 'kubernetes', 'terraform'],
      url: 'https://devops.specsolid.com/cicd/',
    },
    monitoring: {
      title: 'Monitoring & Observability',
      tags: ['prometheus','grafana','loki','monitoring','observability','metrics','logs','traces','alerting','sre','slo','jaeger','elk','datadog'],
      def_en: 'Three pillars: Metrics (Prometheus), Logs (Loki/ELK), and Traces (Jaeger) — providing full system visibility in production.',
      def_es: 'Tres pilares: Métricas (Prometheus), Logs (Loki/ELK) y Trazas (Jaeger) — visibilidad completa del sistema en producción.',
      pronunciation: 'muh-NIT-er-ing',
      commands: [
        'rate(http_requests_total[5m])                # HTTP request rate',
        'histogram_quantile(0.99, sum(rate(...)))     # P99 latency',
        '{app="myapp"} |= "ERROR" | json             # Loki error logs',
        'kubectl top pods -n production --sort-by=cpu # Top consumers',
        'curl -s http://localhost:9090/metrics        # Scrape metrics',
        'amtool alert query alertname=HighErrorRate   # Active alerts',
      ],
      tips: [
        'Three pillars: Metrics, Logs, Traces — all three, not just one',
        'Define SLOs and error budgets BEFORE writing alerts to avoid alert fatigue',
        'USE method for resources: Utilization, Saturation, Errors',
        'RED method for services: Rate, Errors, Duration',
        'High cardinality labels destroy Prometheus performance — avoid user IDs in labels',
      ],
      response_en: 'I implement the full observability stack: Prometheus + Alertmanager for metrics, Loki for log aggregation, and Jaeger for distributed tracing — all in Grafana. I define SLOs first (e.g., 99.9% availability) and use error budgets to decide when to stop feature work for reliability.',
      response_es: 'Implemento el stack completo de observabilidad: Prometheus + Alertmanager para métricas, Loki para agregación de logs y Jaeger para trazas distribuidas — todo en Grafana. Defino SLOs primero (ej. 99.9% disponibilidad) y uso error budgets para decidir cuándo pausar features por confiabilidad.',
      related: ['kubernetes', 'cicd', 'cloud'],
      url: 'https://devops.specsolid.com/monitoring/',
    },
    linux: {
      title: 'Linux / Bash',
      tags: ['linux','bash','shell','unix','terminal','grep','awk','sed','permissions','cron','systemd','networking','chmod','process'],
      def_en: 'Open-source OS kernel; Bash is the primary CLI for system administration, automation, and scripting in DevOps workflows.',
      def_es: 'Núcleo de SO de código abierto; Bash es la CLI principal para administración de sistemas, automatización y scripting en flujos DevOps.',
      pronunciation: 'LIN-ux / bash',
      commands: [
        'grep -r "ERROR" /var/log/ --include="*.log" -l  # Find error logs',
        'awk \'NR>1{print $1,$NF}\' access.log            # Extract columns',
        'find /etc -name "*.conf" -mtime -7 -type f      # Recent config files',
        'chmod 755 script.sh && chown app:app /data      # Permissions',
        'systemctl status nginx && journalctl -u nginx -f # Service & logs',
        'ss -tulpn | grep LISTEN                          # Open ports',
        'ps aux --sort=-%cpu | head -10                   # Top CPU procs',
        'curl -IsL https://api.example.com/ | head -6    # HTTP headers',
      ],
      tips: [
        'Know: ps aux, netstat/ss, df -h, free -m, iostat, vmstat for troubleshooting',
        'Process signals: SIGTERM(15)=graceful shutdown, SIGKILL(9)=force kill',
        'Cron format: minute hour dayOfMonth month dayOfWeek (*/5 = every 5)',
        'File permissions: owner/group/other — rwx = 4+2+1, chmod 644 = rw-r--r--',
        'Pipe chains: cmd1 | cmd2; redirect: > overwrite, >> append, 2>&1 merge stderr',
      ],
      response_en: 'I\'m proficient in Linux system administration — writing Bash scripts for automation, monitoring, and log analysis using awk/grep/sed. I manage services with systemd, troubleshoot network issues with ss and tcpdump, and perform performance analysis with top, iostat, and perf.',
      response_es: 'Tengo dominio de administración de sistemas Linux — escribo scripts Bash para automatización, monitoreo y análisis de logs con awk/grep/sed. Gestiono servicios con systemd, hago troubleshooting de red con ss y tcpdump, y análisis de rendimiento con top, iostat y perf.',
      related: ['docker', 'kubernetes', 'cicd'],
      url: 'https://devops.specsolid.com/foundations/',
    },
    cloud: {
      title: 'Cloud — AWS / GCP / Azure',
      tags: ['aws','gcp','azure','cloud','ec2','s3','lambda','vpc','iam','cloud provider','iaas','paas','eks','gke','aks','rds'],
      def_en: 'On-demand IT resource delivery over the internet. AWS, GCP, and Azure offer IaaS, PaaS, and SaaS with global availability zones.',
      def_es: 'Entrega bajo demanda de recursos de TI a través de internet. AWS, GCP y Azure ofrecen IaaS, PaaS y SaaS con zonas de disponibilidad globales.',
      pronunciation: 'klowd',
      commands: [
        'aws s3 cp file.txt s3://bucket/path --sse AES256  # S3 encrypted upload',
        'aws ec2 describe-instances --region us-east-1      # List EC2 instances',
        'aws sts get-caller-identity                        # Verify IAM identity',
        'gcloud container clusters get-credentials <name>  # GKE auth',
        'gsutil cp file.txt gs://bucket/path               # GCS upload',
        'az aks get-credentials --name cluster --rg group  # AKS auth',
        'aws ssm get-parameter --name /app/db-password --with-decryption # Secrets',
      ],
      tips: [
        'Least privilege IAM: start with no permissions, add only what is needed',
        'VPC design: public subnets for load balancers, private for compute/data',
        'Managed services reduce ops burden: RDS > self-managed MySQL',
        'Multi-AZ deployments for HA; multi-region for DR (different cost profiles)',
        'Tag everything for cost allocation: project, team, environment, owner',
      ],
      response_en: 'I design cloud architectures with multi-AZ VPCs — public subnets for ALBs, private for compute and data tiers. I implement IAM with least-privilege and use AWS SSM Parameter Store/Secrets Manager for credentials. All infrastructure is managed as code via Terraform.',
      response_es: 'Diseño arquitecturas cloud con VPCs multi-AZ — subredes públicas para ALBs, privadas para capas de cómputo y datos. Implemento IAM con mínimo privilegio y uso AWS SSM Parameter Store para credenciales. Toda la infraestructura se gestiona como código con Terraform.',
      related: ['kubernetes', 'terraform', 'cicd'],
      url: 'https://devops.specsolid.com/cloud/',
    },
    security: {
      title: 'Security & Compliance',
      tags: ['security','iso27001','gdpr','pci-dss','soc2','devsecops','owasp','trivy','vault','snyk','rbac','zero-trust','pentest'],
      def_en: 'DevSecOps: integrating security throughout the SDLC. Compliance standards: ISO 27001, GDPR, PCI-DSS, SOC 2 Type II.',
      def_es: 'DevSecOps: integrar seguridad a lo largo del SDLC. Normas de cumplimiento: ISO 27001, GDPR, PCI-DSS, SOC 2 Tipo II.',
      pronunciation: 'seh-KYUR-ih-tee',
      commands: [
        'trivy image myapp:latest --severity HIGH,CRITICAL  # Container scan',
        'snyk test --severity-threshold=high               # Dependency scan',
        'kubectl auth can-i --list --as=system:anonymous   # RBAC audit',
        'vault kv get -mount=secret myapp/db               # Get secrets',
        'openssl s_client -connect host:443 -servername h  # TLS check',
        'aws inspector2 list-findings --filter-criteria ... # AWS findings',
      ],
      tips: [
        'Shift left: scan at PR time, not in production — fix before it ships',
        'Secrets management: HashiCorp Vault or cloud-native (AWS Secrets Manager)',
        'OWASP Top 10 is expected knowledge for senior DevOps/DevSecOps',
        'ISO 27001 = Information Security Management System (ISMS) framework',
        'Zero-trust: never trust, always verify — even internal network traffic',
      ],
      response_en: 'I implement DevSecOps by integrating Trivy for container scanning and Snyk for dependency analysis into CI/CD pipelines as quality gates. I\'ve designed ISO 27001-compliant architectures with proper access controls, secret rotation, and audit logging using HashiCorp Vault and AWS CloudTrail.',
      response_es: 'Implemento DevSecOps integrando Trivy y Snyk como quality gates en pipelines CI/CD. He diseñado arquitecturas conformes con ISO 27001 con controles de acceso, rotación de secretos y logging de auditoría usando HashiCorp Vault y AWS CloudTrail.',
      related: ['kubernetes', 'cloud', 'cicd'],
      url: 'https://devops.specsolid.com/compliance/',
    },
    'spec-driven': {
      title: 'Spec-Driven Development (SDD)',
      tags: ['spec-driven','sdd','specification','spec','alpaquitay','architecture','design-first','spec.md','adr'],
      def_en: 'Engineering methodology where formal spec.md files define acceptance criteria before implementation, enabling predictable AI-assisted development.',
      def_es: 'Metodología de ingeniería donde archivos spec.md formales definen criterios de aceptación antes de la implementación, habilitando desarrollo asistido por IA predecible.',
      pronunciation: 'spek DRY-ven',
      commands: [
        '# spec.md — task format',
        '- [ ] SPEC-001: Feature description',
        '- [x] SPEC-002: Completed feature (git commit tagged)',
        '# ADR format',
        '## Decision: Use Kubernetes for container orchestration',
        '## Status: Accepted | ## Context: ... | ## Consequences: ...',
        '# Alpaquitay AI',
        'alpaquitay spec analyze    # Analyze spec completion',
        'alpaquitay spec generate   # Generate tasks from spec',
      ],
      tips: [
        'Spec = single source of truth for requirements, acceptance criteria, and AI context',
        'ADRs (Architecture Decision Records) document the "why" — not just the "what"',
        'AI as executor of specs, not decision-maker — you set the constraints',
        'SPEC-XXX tagging in git commits enables traceability from commit to requirement',
      ],
      response_en: 'I apply Spec-Driven Development where spec.md files define acceptance criteria before any code is written. This reduces ambiguity when using AI coding tools, improves team alignment, and enables full traceability from git commits back to requirements.',
      response_es: 'Aplico SDD donde archivos spec.md definen criterios de aceptación antes de escribir código. Esto reduce ambigüedad al usar herramientas de IA, mejora el alineamiento del equipo y permite trazabilidad completa desde commits de git hasta requisitos.',
      related: ['kubernetes', 'cicd', 'scrum'],
      url: 'https://ai.specsolid.com/',
    },
    scrum: {
      title: 'Scrum / Agile',
      tags: ['scrum','agile','sprint','backlog','kanban','retrospective','standup','velocity','story points','product owner','scrum master'],
      def_en: 'Agile framework using time-boxed sprints (1-4 weeks), defined ceremonies, and iterative delivery with inspect-and-adapt cycles.',
      def_es: 'Framework ágil que usa sprints con tiempo fijo (1-4 semanas), ceremonias definidas y entrega iterativa con ciclos de inspección y adaptación.',
      pronunciation: 'SKRUM',
      commands: [
        '# 4 Scrum Ceremonies:',
        '1. Sprint Planning  → What + How for the sprint',
        '2. Daily Standup    → 15 min: Done / Today / Blockers',
        '3. Sprint Review    → Demo working software to stakeholders',
        '4. Retrospective    → What went well / improve / action items',
        '# Story Points: Fibonacci — 1, 2, 3, 5, 8, 13, 21',
        '# Definition of Done = team-agreed quality checklist',
        '# User Story: "As a [user] I want [goal] so that [reason]"',
      ],
      tips: [
        'Sprint goal > task list — the goal gives flexibility and focus',
        'Velocity is a planning tool, NOT a performance metric for management',
        'Scrum Master removes blockers, facilitates — not a PM or boss',
        'INVEST criteria for good stories: Independent, Negotiable, Valuable, Estimable, Small, Testable',
        'Working software > comprehensive documentation (Agile Manifesto value 2)',
      ],
      response_en: 'I\'ve worked in Scrum as developer, tech lead, and Scrum Master. I facilitate sprint ceremonies with focus on sprint goal alignment, maintain a groomed backlog with INVEST stories, and run data-driven retrospectives using metrics to continuously improve team delivery.',
      response_es: 'He trabajado en Scrum como desarrollador, tech lead y Scrum Master. Facilito ceremonias de sprint enfocadas en el objetivo del sprint, mantengo un backlog saludable con historias INVEST y ejecuto retrospectivas basadas en datos para mejorar continuamente la entrega del equipo.',
      related: ['spec-driven', 'cicd'],
      url: 'https://scrum.specsolid.com/',
    },
    microservices: {
      title: 'Microservices Architecture',
      tags: ['microservices','microservicios','api','rest','grpc','service mesh','istio','saga','event-driven','kafka','distributed'],
      def_en: 'Architectural style where an application is built as a collection of small, independently deployable services communicating over APIs.',
      def_es: 'Estilo arquitectónico donde una aplicación se construye como una colección de servicios pequeños e independientemente desplegables que se comunican por APIs.',
      pronunciation: 'MY-kro-SER-vis-ez',
      commands: [
        'kubectl apply -f service-mesh/istio/        # Deploy Istio',
        'istioctl analyze                             # Config analysis',
        'kiali dashboard                              # Service mesh UI',
        'kubectl get virtualservices,destinationrules # Traffic rules',
        '# Kafka producer/consumer',
        'kafka-console-producer --topic events       # Produce events',
        'kafka-console-consumer --topic events --from-beginning',
      ],
      tips: [
        'Start with a monolith, extract services when you feel the pain',
        'Each service owns its data — no shared databases',
        'Distributed tracing is mandatory — you cannot debug without it',
        'Circuit breaker pattern prevents cascade failures',
        'Event-driven (Kafka/Kinesis) decouples services better than REST',
      ],
      response_en: 'I design microservices with clear bounded contexts, each service owning its database. I implement service mesh with Istio for traffic management and observability, event-driven communication with Kafka for async workflows, and distributed tracing with Jaeger for debugging across service boundaries.',
      response_es: 'Diseño microservicios con contextos delimitados claros, cada servicio propietario de su base de datos. Implemento service mesh con Istio para gestión de tráfico y observabilidad, comunicación event-driven con Kafka para flujos async, y trazas distribuidas con Jaeger.',
      related: ['kubernetes', 'monitoring', 'cicd'],
      url: 'https://devops.specsolid.com/advanced/',
    },
  };

  /* ── FUZZY SEARCH ENGINE ──────────────────────────────── */
  function tokenize(s) {
    return s.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(function(t) { return t.length > 1; });
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    var la = a.length, lb = b.length;
    if (!la) return lb;
    if (!lb) return la;
    var row = Array.from({ length: lb + 1 }, function(_, i) { return i; });
    for (var i = 1; i <= la; i++) {
      var prev = i;
      for (var j = 1; j <= lb; j++) {
        var curr = a[i - 1] === b[j - 1] ? row[j - 1] : 1 + Math.min(row[j], prev, row[j - 1]);
        row[j - 1] = prev;
        prev = curr;
      }
      row[lb] = prev;
    }
    return row[lb];
  }

  function scoreToken(q, t) {
    if (t === q) return 1;
    if (t.startsWith(q) || q.startsWith(t)) return 0.88;
    var dist = levenshtein(q, t);
    var sim = 1 - dist / Math.max(q.length, t.length);
    return sim >= 0.72 ? sim * 0.82 : 0;
  }

  function fuzzySearch(query, limit) {
    if (!query || query.length < 2) return [];
    var qToks = tokenize(query);
    var ql = query.toLowerCase();
    var results = [];
    for (var i = 0; i < PAGES.length; i++) {
      var page = PAGES[i];
      var text = (page.title + ' ' + page.tags.join(' ')).toLowerCase();
      var pToks = tokenize(text);
      var score = 0;
      if (text.includes(ql)) score += 2.5;
      for (var qi = 0; qi < qToks.length; qi++) {
        var best = 0;
        for (var pi = 0; pi < pToks.length; pi++) {
          best = Math.max(best, scoreToken(qToks[qi], pToks[pi]));
        }
        score += best;
      }
      if (score > 0.6) results.push({ page: page, score: score });
    }
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, limit || cfg.maxLocal).map(function(r) { return r.page; });
  }

  function matchKB(query) {
    var ql = query.toLowerCase();
    var found = [];
    var keys = Object.keys(KB);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var topic = KB[key];
      for (var j = 0; j < topic.tags.length; j++) {
        if (ql.includes(topic.tags[j]) || topic.tags[j].includes(ql)) {
          found.push({ key: key, topic: topic });
          break;
        }
      }
    }
    return found.slice(0, 4);
  }

  function extractKeywords(transcript) {
    var lower = transcript.toLowerCase();
    var found = [];
    var keys = Object.keys(KB);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var topic = KB[key];
      for (var j = 0; j < topic.tags.length; j++) {
        if (lower.includes(topic.tags[j])) {
          if (!found.some(function(f) { return f.key === key; })) {
            found.push({ key: key, topic: topic });
          }
          break;
        }
      }
    }
    return found;
  }

  /* ── EXTERNAL APIs ────────────────────────────────────── */
  async function fetchPapers(query) {
    try {
      var ctrl = new AbortController();
      var tid = setTimeout(function() { ctrl.abort(); }, cfg.apiTimeout);
      var url = 'https://api.semanticscholar.org/graph/v1/paper/search'
        + '?query=' + encodeURIComponent(query)
        + '&fields=title,year,citationCount,externalIds,authors'
        + '&limit=6';
      var res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) return [];
      var data = await res.json();
      return (data.data || [])
        .filter(function(p) { return p.year >= 2021 && p.citationCount >= 3; })
        .slice(0, 4)
        .map(function(p) {
          return {
            title: p.title,
            year: p.year,
            citations: p.citationCount,
            url: p.externalIds && p.externalIds.DOI
              ? 'https://doi.org/' + p.externalIds.DOI
              : 'https://www.semanticscholar.org/paper/' + p.paperId,
            authors: (p.authors || []).slice(0, 2).map(function(a) { return a.name; }).join(', '),
            impact: p.citationCount > 100 ? 'High Impact'
              : p.citationCount > 30 ? 'Notable'
              : p.citationCount > 10 ? 'Cited' : '',
          };
        });
    } catch (e) { return []; }
  }

  async function translateText(text, from, to) {
    if (!text || text.length < 3) return '';
    try {
      var ctrl = new AbortController();
      var tid = setTimeout(function() { ctrl.abort(); }, 4500);
      var url = 'https://api.mymemory.translated.net/get'
        + '?q=' + encodeURIComponent(text.slice(0, 400))
        + '&langpair=' + from + '|' + to
        + '&de=sergioide007%40gmail.com';
      var res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) return '';
      var data = await res.json();
      var t = (data.responseData && data.responseData.translatedText) || '';
      /* MyMemory sometimes returns ALL CAPS for errors */
      return t && t !== t.toUpperCase() ? t : '';
    } catch (e) { return ''; }
  }

  /* ── PRIVACY / CONSENT ────────────────────────────────── */
  var KEY_VOICE = 'specsolid_voice_consent_v1';
  var KEY_INTERVIEW = 'specsolid_interview_consent_v1';

  function getConsent(key) {
    try { return localStorage.getItem(key) === 'granted'; } catch (e) { return false; }
  }
  function setConsent(key, v) {
    try { localStorage.setItem(key, v ? 'granted' : 'denied'); } catch (e) {}
  }

  function showConsentModal(key, onAccept, onDecline) {
    var isInterview = (key === KEY_INTERVIEW);
    var modal = d.createElement('div');
    modal.className = 'ss-consent-modal';
    modal.innerHTML = '<div class="ss-consent-box">'
      + '<div class="ss-consent-icon">' + (isInterview ? '🎯' : '🎤') + '</div>'
      + '<h3>' + (isInterview ? 'Activar Asistente de Entrevista' : 'Activar Búsqueda por Voz') + '</h3>'
      + '<p>'
      + (isInterview
        ? 'El asistente escucha activamente la conversación para brindarte <strong>traducción en tiempo real</strong>, '
          + '<strong>keywords técnicas</strong> y <strong>sugerencias de respuesta</strong> durante tu entrevista.'
        : 'La búsqueda por voz usa el micrófono de tu dispositivo para convertir voz en texto de búsqueda.')
      + '</p>'
      + '<div class="ss-consent-gdpr">'
      + '<strong>Privacidad:</strong> El audio se procesa localmente en tu navegador mediante la Web Speech API del sistema operativo. '
      + 'No almacenamos ni transmitimos grabaciones de audio. Puedes desactivarlo en cualquier momento. '
      + 'Cumple con GDPR Art. 7 y CCPA Section 1798.100.'
      + '</div>'
      + '<div class="ss-consent-actions">'
      + '<button class="ss-btn ss-btn-accept" id="ss-ca">' + (isInterview ? 'Activar Asistente' : 'Permitir Micrófono') + '</button>'
      + '<button class="ss-btn ss-btn-decline" id="ss-cd">Cancelar</button>'
      + '</div>'
      + '<p class="ss-consent-note">Puedes cambiar este permiso en cualquier momento.</p>'
      + '</div>';
    d.body.appendChild(modal);
    d.getElementById('ss-ca').addEventListener('click', function() {
      setConsent(key, true);
      modal.remove();
      onAccept && onAccept();
    });
    d.getElementById('ss-cd').addEventListener('click', function() {
      modal.remove();
      onDecline && onDecline();
    });
  }

  function showToast(msg) {
    var t = d.createElement('div');
    t.className = 'ss-toast';
    t.textContent = msg;
    d.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
  }

  /* ── SPEECH RECOGNITION INIT ──────────────────────────── */
  var SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;

  function initVoiceRec(lang, continuous, interimResults, onResult, onEnd) {
    if (!SpeechRec) return null;
    var rec = new SpeechRec();
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = interimResults;
    rec.maxAlternatives = 1;
    rec.onresult = onResult;
    rec.onend = onEnd;
    rec.onerror = function(e) {
      if (e.error !== 'no-speech' && e.error !== 'aborted') onEnd && onEnd(e);
    };
    return rec;
  }

  /* ── HTML ESCAPE ─────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ═══════════════════════════════════════════════════════
     SEARCH OVERLAY
     ═══════════════════════════════════════════════════════ */
  var _overlay = null, _input = null, _results = null, _voiceBtn = null;
  var _debounce = null, _apiCtrl = null;
  var _voiceRec = null, _voiceActive = false;

  function buildOverlay() {
    var el = d.createElement('div');
    el.id = 'ss-overlay';
    el.className = 'ss-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Buscador SpecSolid');

    var topicChips = (cfg.topics || []).slice(0, 8).map(function(t) {
      return '<button class="ss-hint-chip" data-q="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');

    el.innerHTML = '<div class="ss-modal" role="search">'
      /* Search bar */
      + '<div class="ss-search-bar">'
      + '<span class="ss-search-icon" aria-hidden="true">'
      + '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
      + '</span>'
      + '<input id="ss-input" class="ss-input" type="search" placeholder="'
      + (cfg.lang === 'es' ? 'Buscar guías, comandos, temas...' : 'Search guides, commands, topics...')
      + '" autocomplete="off" spellcheck="false" aria-label="Buscar" aria-autocomplete="list">'
      + '<button class="ss-voice-btn ss-btn-icon" id="ss-voice-btn" title="Búsqueda por voz" aria-label="Búsqueda por voz">'
      + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
      + '</button>'
      + '<button class="ss-interview-btn ss-btn-icon" id="ss-iv-trigger" title="Asistente de Entrevista">🎯 Entrevista</button>'
      + '<button class="ss-close-btn ss-btn-icon" id="ss-close-btn" aria-label="Cerrar">'
      + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      + '</button>'
      + '</div>'
      /* Voice status */
      + '<div id="ss-voice-status" class="ss-voice-status" hidden>'
      + '<span class="ss-voice-dot"></span>'
      + '<span id="ss-voice-text">Escuchando...</span>'
      + '</div>'
      /* Results */
      + '<div id="ss-results" class="ss-results" role="listbox">'
      + '<div class="ss-results-empty">'
      + '<div class="ss-hint-row"><kbd>↑↓</kbd> navegar&nbsp; <kbd>Enter</kbd> abrir&nbsp; <kbd>Esc</kbd> cerrar&nbsp; <kbd>Ctrl+K</kbd> abrir</div>'
      + '<div class="ss-hint-topics">' + topicChips + '</div>'
      + '</div>'
      + '</div>'
      /* Footer */
      + '<div class="ss-footer">'
      + '<span><span class="ss-footer-site">' + esc(cfg.site) + '</span> &middot; <a href="https://www.specsolid.com" target="_blank" class="ss-footer-link">SpecSolid</a></span>'
      + '<button class="ss-footer-btn" id="ss-footer-iv">🎯 Asistente Entrevista</button>'
      + '</div>'
      + '</div>';

    d.body.appendChild(el);

    _overlay  = el;
    _input    = d.getElementById('ss-input');
    _results  = d.getElementById('ss-results');
    _voiceBtn = d.getElementById('ss-voice-btn');

    /* Events */
    el.addEventListener('click', function(e) { if (e.target === el) closeSearch(); });
    d.getElementById('ss-close-btn').addEventListener('click', closeSearch);
    _input.addEventListener('input', _onInput);
    _input.addEventListener('keydown', _onKeydown);
    _voiceBtn.addEventListener('click', _onVoiceClick);

    function openIV() { closeSearch(); openInterview(); }
    d.getElementById('ss-iv-trigger').addEventListener('click', openIV);
    d.getElementById('ss-footer-iv').addEventListener('click', openIV);

    /* Hint chips */
    el.querySelectorAll('.ss-hint-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        _input.value = chip.dataset.q;
        _doSearch(chip.dataset.q);
      });
    });
  }

  function _onInput() {
    clearTimeout(_debounce);
    _debounce = setTimeout(function() { _doSearch(_input.value); }, cfg.debounceMs);
  }

  function _onKeydown(e) {
    var items = _results.querySelectorAll('a.ss-result-item, div.ss-topic-item');
    var focused = _results.querySelector('.ss-result-item.focused, .ss-topic-item.focused');
    var idx = Array.from(items).indexOf(focused);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = Math.min(idx + 1, items.length - 1);
      if (idx < 0) idx = 0;
      items.forEach(function(i) { i.classList.remove('focused'); });
      if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = Math.max(idx - 1, 0);
      items.forEach(function(i) { i.classList.remove('focused'); });
      if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'Enter' && focused) {
      e.preventDefault();
      if (focused.href) w.open(focused.href, '_blank');
      else focused.click();
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  }

  async function _doSearch(query) {
    query = (query || '').trim();
    if (!query) { _showEmpty(); return; }

    if (_apiCtrl) { try { _apiCtrl.abort(); } catch (e) {} }
    _apiCtrl = new AbortController();

    var local = fuzzySearch(query);
    var kb    = matchKB(query);
    _renderResults(local, kb, query);

    /* async: academic papers */
    fetchPapers(query).then(function(papers) {
      if (papers.length) _appendPapers(papers, query);
    });
  }

  function _renderResults(local, kb, query) {
    var html = '';

    if (local.length) {
      html += '<div class="ss-section-label">Páginas — ' + esc(cfg.site) + ' &amp; sitios</div>';
      html += local.map(function(p) {
        var host = p.url.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
        var path = p.url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '').slice(0, 40);
        return '<a class="ss-result-item" href="' + esc(p.url) + '" target="_blank" rel="noopener">'
          + '<span class="ss-result-icon">📄</span>'
          + '<span class="ss-result-content">'
          + '<span class="ss-result-title">' + esc(p.title) + '</span>'
          + '<span class="ss-result-url">' + esc(host) + (path ? ' › ' + esc(path) : '') + '</span>'
          + '</span>'
          + '<span class="ss-result-arrow">↗</span>'
          + '</a>';
      }).join('');
    }

    if (kb.length) {
      html += '<div class="ss-section-label">Temas relacionados</div>';
      html += kb.map(function(m) {
        return '<div class="ss-topic-item ss-result-item" data-key="' + esc(m.key) + '" tabindex="0">'
          + '<span class="ss-result-icon">📚</span>'
          + '<span class="ss-result-content">'
          + '<span class="ss-result-title">' + esc(m.topic.title) + '</span>'
          + '<span class="ss-result-url">' + esc(m.topic.def_es.slice(0, 75)) + '…</span>'
          + '</span>'
          + '<span class="ss-result-arrow">▸</span>'
          + '</div>';
      }).join('');
    }

    /* YouTube link — always show */
    html += '<div class="ss-section-label">Videos</div>'
      + '<a class="ss-result-item" href="https://www.youtube.com/results?search_query='
      + encodeURIComponent(query + ' tutorial 2024 2025')
      + '" target="_blank" rel="noopener">'
      + '<span class="ss-result-icon">▶️</span>'
      + '<span class="ss-result-content">'
      + '<span class="ss-result-title">Buscar "' + esc(query) + '" en YouTube</span>'
      + '<span class="ss-result-url">youtube.com · videos y tutoriales recientes</span>'
      + '</span>'
      + '<span class="ss-result-arrow">↗</span>'
      + '</a>';

    /* Placeholders for async papers */
    html += '<div class="ss-section-label ss-papers-lbl" id="ss-papers-lbl" hidden>Artículos académicos (Semantic Scholar)</div>';
    html += '<div id="ss-papers-box"></div>';

    if (!local.length && !kb.length) {
      html += '<div class="ss-no-results">'
        + '<p>Sin resultados para "<strong>' + esc(query) + '</strong>"</p>'
        + '<p>Intenta en: '
        + '<a href="https://www.google.com/search?q=site%3Aspecsolid.com+' + encodeURIComponent(query) + '" target="_blank">Google ↗</a>'
        + ' · <a href="https://arxiv.org/search/?query=' + encodeURIComponent(query) + '&searchtype=all" target="_blank">arXiv ↗</a>'
        + '</p>'
        + '</div>';
    }

    _results.innerHTML = html;

    /* Topic expand on click */
    _results.querySelectorAll('.ss-topic-item').forEach(function(item) {
      function expand() {
        var key = item.dataset.key;
        var topic = KB[key];
        if (!topic) return;
        var detail = d.createElement('div');
        detail.className = 'ss-topic-detail';
        detail.innerHTML = '<div class="ss-kb-card">'
          + '<div class="ss-kb-header">'
          + '<span class="ss-kb-title">' + esc(topic.title) + '</span>'
          + (topic.pronunciation ? '<span class="ss-kb-pron">/' + esc(topic.pronunciation) + '/</span>' : '')
          + '</div>'
          + '<div class="ss-kb-def">' + esc(topic.def_es) + '</div>'
          + '<div class="ss-kb-def ss-kb-def-en">' + esc(topic.def_en) + '</div>'
          + (topic.commands && topic.commands.length
            ? '<div class="ss-kb-commands">'
              + topic.commands.slice(0, 5).map(function(c) { return '<code class="ss-kb-cmd">' + esc(c) + '</code>'; }).join('')
              + '</div>' : '')
          + (topic.tips && topic.tips.length
            ? '<div class="ss-kb-tips">'
              + topic.tips.slice(0, 3).map(function(t) { return '<div class="ss-kb-tip">💡 ' + esc(t) + '</div>'; }).join('')
              + '</div>' : '')
          + (topic.url ? '<div style="padding-top:8px"><a href="' + esc(topic.url) + '" target="_blank" style="font-size:12px;color:var(--ss-signal);font-family:var(--ss-mono)">Ver guía completa ↗</a></div>' : '')
          + '</div>';
        item.parentNode.insertBefore(detail, item.nextSibling);
        item.remove();
      }
      item.addEventListener('click', expand);
      item.addEventListener('keydown', function(e) { if (e.key === 'Enter') expand(); });
    });
  }

  function _appendPapers(papers, query) {
    var lbl = d.getElementById('ss-papers-lbl');
    var box = d.getElementById('ss-papers-box');
    if (!lbl || !box) return;
    lbl.hidden = false;
    box.innerHTML = papers.map(function(p) {
      var badge = p.impact ? '<span class="ss-paper-badge">' + esc(p.impact) + '</span>' : '';
      return '<a class="ss-result-item ss-paper-item" href="' + esc(p.url) + '" target="_blank" rel="noopener">'
        + '<span class="ss-result-icon">📑</span>'
        + '<span class="ss-result-content">'
        + '<span class="ss-result-title">' + esc(p.title) + '</span>'
        + '<span class="ss-result-meta">'
        + esc(p.authors || '') + ' · ' + (p.year || '') + ' · '
        + '<span class="ss-citations">' + p.citations + ' citas</span>' + badge
        + '</span>'
        + '</span>'
        + '<span class="ss-result-arrow">↗</span>'
        + '</a>';
    }).join('')
    + '<a class="ss-result-item" href="https://arxiv.org/search/?query=' + encodeURIComponent(query) + '&searchtype=all" target="_blank" rel="noopener">'
    + '<span class="ss-result-icon">🔬</span>'
    + '<span class="ss-result-content">'
    + '<span class="ss-result-title">Buscar en arXiv</span>'
    + '<span class="ss-result-url">arxiv.org · preprints y papers recientes</span>'
    + '</span><span class="ss-result-arrow">↗</span></a>';
  }

  function _showEmpty() {
    var topicChips = (cfg.topics || []).slice(0, 8).map(function(t) {
      return '<button class="ss-hint-chip" data-q="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');
    _results.innerHTML = '<div class="ss-results-empty">'
      + '<div class="ss-hint-row"><kbd>↑↓</kbd> navegar&nbsp; <kbd>Enter</kbd> abrir&nbsp; <kbd>Esc</kbd> cerrar</div>'
      + '<div class="ss-hint-topics">' + topicChips + '</div>'
      + '</div>';
    _results.querySelectorAll('.ss-hint-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        _input.value = chip.dataset.q;
        _doSearch(chip.dataset.q);
      });
    });
  }

  /* ── VOICE SEARCH ─────────────────────────────────────── */
  function _onVoiceClick() {
    if (!SpeechRec) { showToast('Voz no disponible — usa Chrome, Edge o Safari'); return; }
    if (_voiceActive) { _stopVoice(); return; }
    if (getConsent(KEY_VOICE)) { _startVoice(); }
    else { showConsentModal(KEY_VOICE, _startVoice, null); }
  }

  function _startVoice() {
    _voiceActive = true;
    _voiceBtn.classList.add('ss-voice-active');
    var status = d.getElementById('ss-voice-status');
    var statusTxt = d.getElementById('ss-voice-text');
    status.hidden = false;

    var autoTimer = null;
    _voiceRec = initVoiceRec(
      cfg.lang === 'es' ? 'es-ES' : 'en-US',
      false, true,
      function(e) {
        var t = Array.from(e.results).map(function(r) { return r[0].transcript; }).join('');
        _input.value = t;
        statusTxt.textContent = t || 'Escuchando…';
        var isFinal = e.results[e.results.length - 1].isFinal;
        if (isFinal && cfg.voiceAutoSubmit) {
          clearTimeout(autoTimer);
          autoTimer = setTimeout(function() { _doSearch(t); }, cfg.voiceAutoSubmitDelay);
        } else {
          clearTimeout(autoTimer);
        }
      },
      function() { _stopVoice(); if (_input.value) _doSearch(_input.value); }
    );
    try { _voiceRec.start(); } catch (e) { _stopVoice(); }
  }

  function _stopVoice() {
    _voiceActive = false;
    _voiceBtn.classList.remove('ss-voice-active');
    var status = d.getElementById('ss-voice-status');
    if (status) status.hidden = true;
    try { if (_voiceRec) _voiceRec.stop(); } catch (e) {}
    _voiceRec = null;
  }

  /* ── OPEN / CLOSE SEARCH ──────────────────────────────── */
  function openSearch(q) {
    if (!_overlay) buildOverlay();
    _overlay.classList.add('ss-open');
    d.body.style.overflow = 'hidden';
    requestAnimationFrame(function() {
      _input.focus();
      if (q) { _input.value = q; _doSearch(q); }
    });
  }

  function closeSearch() {
    if (!_overlay) return;
    _stopVoice();
    _overlay.classList.remove('ss-open');
    d.body.style.overflow = '';
    clearTimeout(_debounce);
  }

  /* ═══════════════════════════════════════════════════════
     INTERVIEW ASSISTANT
     ═══════════════════════════════════════════════════════ */
  var _ivPanel = null, _ivActive = false, _ivRec = null;
  var _ivHistory = [];        /* accumulates keyword cards — never cleared unless user asks */
  var _transQueue = [];
  var _transRunning = false;

  function _queueTranslation(text, cb) {
    _transQueue.push({ text: text, cb: cb });
    _processTransQueue();
  }

  async function _processTransQueue() {
    if (_transRunning || !_transQueue.length) return;
    _transRunning = true;
    var item = _transQueue.shift();
    var result = await translateText(item.text, 'en', 'es');
    item.cb(result);
    _transRunning = false;
    setTimeout(_processTransQueue, 150);
  }

  function buildInterviewPanel() {
    var el = d.createElement('div');
    el.id = 'ss-interview';
    el.className = 'ss-interview';
    el.setAttribute('role', 'complementary');
    el.setAttribute('aria-label', 'Asistente de Entrevista');

    el.innerHTML = /* ── Header ── */
      '<div class="ss-iv-header">'
      + '<div class="ss-iv-title">🎯 <span>Asistente de Entrevista</span></div>'
      + '<span class="ss-iv-badge" id="ss-iv-badge">Inactivo</span>'
      + '<div class="ss-iv-controls">'
      + '<button class="ss-iv-btn ss-iv-btn-mic" id="ss-iv-mic">🎤 Iniciar</button>'
      + '<button class="ss-iv-btn ss-iv-btn-close" id="ss-iv-close" aria-label="Cerrar">✕</button>'
      + '</div>'
      + '</div>'
      /* ── Language bar ── */
      + '<div class="ss-iv-lang-bar">'
      + '<span class="ss-iv-lang-label">Escucha:</span>'
      + '<button class="ss-iv-lang-btn active" data-lang="en-US">English</button>'
      + '<button class="ss-iv-lang-btn" data-lang="es-ES">Español</button>'
      + '<button class="ss-iv-lang-btn" data-lang="hi-IN">हिन्दी</button>'
      + '<span class="ss-iv-lang-sep">|</span>'
      + '<span class="ss-iv-lang-label">Trad:</span>'
      + '<span id="ss-iv-tlang">→ Español</span>'
      + '</div>'
      /* ── Body ── */
      + '<div class="ss-iv-body" id="ss-iv-body">'
      + '<div class="ss-iv-welcome">'
      + '<p>Activa el micrófono para comenzar la asistencia en tiempo real.</p>'
      + '<p class="ss-iv-welcome-sub">Ideal para entrevistas técnicas de DevOps en inglés, reuniones en Google Meet, llamadas en inglés.</p>'
      + '<div class="ss-iv-features">'
      + '<div class="ss-iv-feature">📝 Transcripción en tiempo real</div>'
      + '<div class="ss-iv-feature">🌍 Traducción EN ↔ ES</div>'
      + '<div class="ss-iv-feature">🔑 Keywords técnicas detectadas</div>'
      + '<div class="ss-iv-feature">💡 Tips para la entrevista</div>'
      + '<div class="ss-iv-feature">⌨️ Comandos a mencionar</div>'
      + '<div class="ss-iv-feature">🗣️ Pronunciación correcta</div>'
      + '</div>'
      + '</div>'
      + '</div>'
      /* ── Footer ── */
      + '<div class="ss-iv-footer">'
      + '<span class="ss-iv-privacy">🔒 Audio procesado localmente · Sin grabación remota · GDPR/CCPA</span>'
      + '<button class="ss-iv-clear-btn" id="ss-iv-clear">Limpiar</button>'
      + '</div>';

    d.body.appendChild(el);
    _ivPanel = el;

    /* Events */
    d.getElementById('ss-iv-close').addEventListener('click', closeInterview);
    d.getElementById('ss-iv-mic').addEventListener('click', _toggleMic);
    d.getElementById('ss-iv-clear').addEventListener('click', function() {
      _ivHistory = [];
      d.getElementById('ss-iv-body').innerHTML = '<div class="ss-iv-cleared">Historial limpiado. Activa el micrófono para continuar.</div>';
    });

    /* Language buttons */
    el.querySelectorAll('.ss-iv-lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        el.querySelectorAll('.ss-iv-lang-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var isEn = btn.dataset.lang.startsWith('en');
        var isEs = btn.dataset.lang.startsWith('es');
        d.getElementById('ss-iv-tlang').textContent = isEn ? '→ Español' : isEs ? '→ English' : '→ Español';
        if (_ivRec) { _ivRec.lang = btn.dataset.lang; }
        if (_ivActive) { try { _ivRec.stop(); } catch (e) {} }
      });
    });

    return el;
  }

  function openInterview() {
    if (!SpeechRec) { showToast('Reconocimiento de voz no disponible — usa Chrome o Edge'); return; }
    if (getConsent(KEY_INTERVIEW)) { _showIvPanel(); }
    else { showConsentModal(KEY_INTERVIEW, _showIvPanel, null); }
  }

  function _showIvPanel() {
    if (!_ivPanel) buildInterviewPanel();
    _ivPanel.classList.add('ss-iv-open');
  }

  function closeInterview() {
    if (!_ivPanel) return;
    _stopMic();
    _ivPanel.classList.remove('ss-iv-open');
  }

  function _toggleMic() {
    if (_ivActive) _stopMic(); else _startMic();
  }

  function _startMic() {
    _ivActive = true;
    var micBtn = d.getElementById('ss-iv-mic');
    var badge  = d.getElementById('ss-iv-badge');
    micBtn.textContent = '⏹ Detener';
    micBtn.classList.add('ss-iv-listening');
    badge.textContent = '● EN VIVO';
    badge.classList.add('ss-iv-badge-active');

    /* Determine language and translation direction */
    var activeLang = (_ivPanel.querySelector('.ss-iv-lang-btn.active') || {}).dataset;
    var recLang = (activeLang && activeLang.lang) ? activeLang.lang : 'en-US';
    var srcLang = recLang.split('-')[0];           /* 'en', 'es', 'hi' */
    var tgtLang = (srcLang === 'es') ? 'en' : 'es'; /* translate to opposite */

    /* Remove welcome */
    var body = d.getElementById('ss-iv-body');
    var welcome = body.querySelector('.ss-iv-welcome');
    if (welcome) welcome.remove();

    /* Live transcript element */
    var liveEl = d.getElementById('ss-iv-live');
    if (!liveEl) {
      liveEl = d.createElement('div');
      liveEl.id = 'ss-iv-live';
      liveEl.className = 'ss-iv-live';
      liveEl.textContent = '…';
      body.insertBefore(liveEl, body.firstChild);
    }

    var finalBuf = '';

    _ivRec = initVoiceRec(
      recLang, true, true,
      function(e) {
        var interim = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            var segment = e.results[i][0].transcript;
            finalBuf += segment + ' ';
            /* Translate segment */
            (function(seg) {
              _queueTranslation(seg, function(translated) {
                _addSegment(seg, translated, srcLang, tgtLang);
                /* Keyword detection */
                var kws = extractKeywords(seg);
                kws.forEach(function(m) {
                  var alreadyShown = _ivHistory.some(function(h) { return h.key === m.key; });
                  if (!alreadyShown) {
                    _ivHistory.push({ key: m.key, ts: Date.now() });
                    _addKeywordCard(m.key, m.topic);
                  }
                });
              });
            })(segment);
          } else {
            interim = e.results[i][0].transcript;
          }
        }
        /* Update live display */
        var live = d.getElementById('ss-iv-live');
        if (live) live.textContent = finalBuf.slice(-120) + (interim ? ' ' + interim : '');
      },
      function() {
        /* Auto-restart continuous listening */
        if (_ivActive) {
          setTimeout(function() { try { if (_ivRec) _ivRec.start(); } catch (e) {} }, 200);
        }
      }
    );

    _ivRec.lang = recLang;
    try { _ivRec.start(); } catch (e) { _stopMic(); showToast('No se pudo acceder al micrófono'); }
  }

  function _stopMic() {
    _ivActive = false;
    try { if (_ivRec) _ivRec.stop(); } catch (e) {}
    _ivRec = null;
    var micBtn = d.getElementById('ss-iv-mic');
    var badge  = d.getElementById('ss-iv-badge');
    if (micBtn) { micBtn.textContent = '🎤 Iniciar'; micBtn.classList.remove('ss-iv-listening'); }
    if (badge)  { badge.textContent = 'Pausado'; badge.classList.remove('ss-iv-badge-active'); }
    var live = d.getElementById('ss-iv-live');
    if (live) live.textContent = '— Pausado —';
  }

  function _addSegment(original, translated, srcLang, tgtLang) {
    var body = d.getElementById('ss-iv-body');
    if (!body) return;
    var seg = d.createElement('div');
    seg.className = 'ss-iv-segment';
    seg.innerHTML = '<div class="ss-iv-seg-original">'
      + '<span class="ss-iv-seg-lang">' + esc(srcLang.toUpperCase()) + '</span>'
      + esc(original)
      + '</div>'
      + (translated
        ? '<div class="ss-iv-seg-translation">'
          + '<span class="ss-iv-seg-lang">' + esc(tgtLang.toUpperCase()) + '</span>'
          + esc(translated)
          + '</div>'
        : '');

    /* Insert after live el */
    var live = d.getElementById('ss-iv-live');
    if (live && live.nextSibling) body.insertBefore(seg, live.nextSibling);
    else body.appendChild(seg);
    body.scrollTop = body.scrollHeight;
  }

  function _addKeywordCard(key, topic) {
    var body = d.getElementById('ss-iv-body');
    if (!body) return;
    var card = d.createElement('div');
    card.className = 'ss-iv-keyword-card';

    var cmdsHtml = (topic.commands && topic.commands.length)
      ? '<div class="ss-iv-kw-section-label">Comandos a mencionar:</div>'
        + '<div class="ss-iv-kw-cmds">'
        + topic.commands.slice(0, 5).map(function(c) {
            return '<code class="ss-iv-cmd">' + esc(c) + '</code>';
          }).join('')
        + '</div>' : '';

    var tipsHtml = (topic.tips && topic.tips.length)
      ? '<div class="ss-iv-kw-section-label">Tips de entrevista:</div>'
        + '<div class="ss-iv-kw-tips">'
        + topic.tips.slice(0, 4).map(function(t) {
            return '<div class="ss-iv-tip">💡 ' + esc(t) + '</div>';
          }).join('')
        + '</div>' : '';

    var respHtml = topic.response_en
      ? '<div class="ss-iv-kw-section-label">Respuesta sugerida:</div>'
        + '<div class="ss-iv-kw-response">'
        + '<div class="ss-iv-resp-en">🇺🇸 ' + esc(topic.response_en) + '</div>'
        + (topic.response_es ? '<div class="ss-iv-resp-es">🌎 ' + esc(topic.response_es) + '</div>' : '')
        + '</div>' : '';

    var relatedHtml = (topic.related && topic.related.length)
      ? '<div class="ss-iv-kw-related">Relacionado: '
        + topic.related.map(function(r) {
            return '<span class="ss-iv-related-chip">' + esc(r) + '</span>';
          }).join(' ')
        + '</div>' : '';

    card.innerHTML = '<div class="ss-iv-kw-header">'
      + '<strong>' + esc(topic.title) + '</strong>'
      + (topic.pronunciation ? '<span class="ss-iv-kw-pron">/' + esc(topic.pronunciation) + '/</span>' : '')
      + '<button class="ss-iv-kw-collapse" aria-label="Colapsar">▾</button>'
      + '</div>'
      + '<div class="ss-iv-kw-body">'
      + '<div class="ss-iv-kw-defs">'
      + '<div class="ss-iv-kw-def-en">🇺🇸 ' + esc(topic.def_en) + '</div>'
      + '<div class="ss-iv-kw-def-es">🌎 ' + esc(topic.def_es) + '</div>'
      + '</div>'
      + cmdsHtml + tipsHtml + respHtml + relatedHtml
      + '</div>';

    /* Collapse / expand */
    var kbBody = card.querySelector('.ss-iv-kw-body');
    var colBtn  = card.querySelector('.ss-iv-kw-collapse');
    colBtn.addEventListener('click', function() {
      var hidden = kbBody.style.display === 'none';
      kbBody.style.display = hidden ? '' : 'none';
      colBtn.textContent   = hidden ? '▾' : '▸';
    });

    body.appendChild(card);
    body.scrollTop = body.scrollHeight;
  }

  /* ═══════════════════════════════════════════════════════
     NAV BUTTON INJECTION
     ═══════════════════════════════════════════════════════ */
  function injectNavBtn() {
    /* Try .nav-cta (SpecSolid pattern) */
    var cta = d.querySelector('.nav-cta');
    if (!cta) return;
    var btn = d.createElement('button');
    btn.className = 'ss-nav-search-btn';
    btn.setAttribute('aria-label', 'Buscar (Ctrl+K)');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
      + '<span class="ss-nav-search-hint">Ctrl+K</span>';
    btn.addEventListener('click', function() { openSearch(); });
    cta.insertBefore(btn, cta.firstChild);
  }

  /* ═══════════════════════════════════════════════════════
     GLOBAL KEYBOARD SHORTCUT
     ═══════════════════════════════════════════════════════ */
  d.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (_overlay && _overlay.classList.contains('ss-open')) closeSearch();
      else openSearch();
    }
    if (e.key === 'Escape') {
      if (_overlay && _overlay.classList.contains('ss-open')) closeSearch();
    }
  });

  /* ═══════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════ */
  function init() {
    injectNavBtn();
    /* Pre-build overlay for faster first open */
    buildOverlay();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();

  /* ── PUBLIC API ── */
  w.SpecSearch = {
    open: openSearch,
    close: closeSearch,
    interview: openInterview,
    closeInterview: closeInterview,
  };

})(window, document);
