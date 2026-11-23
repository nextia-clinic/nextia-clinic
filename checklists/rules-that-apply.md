# Which rules apply to you?

This is not legal advice. It helps you ask the right questions, and if your data is sensitive, ask a professional before you go live.

## 1. Answer three questions for your own business

1. **What data will your app keep?** For example: names and emails, health information, payment details, information about children.
2. **Where do your customers live?** The rules follow your customers, not only your business.
3. **Who might ask you about security?** For example: larger customers, partners, insurers.

## 2. Look up the rules for your data and your customers

Some official starting points:

| Where | What | Link |
|---|---|---|
| Canada | Federal privacy law for businesses (PIPEDA) | https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/ |
| Canada | Provincial laws that may apply instead, including health information laws | https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/02_05_d_15/ |
| Quebec | Privacy law for the private sector (updated by Law 25) | https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1 |
| Quebec | The privacy regulator (Commission d'accès à l'information) | https://www.cai.gouv.qc.ca/ |
| Ontario | Personal Health Information Protection Act (PHIPA) | https://www.ontario.ca/laws/statute/04p03 |
| Quebec | French language rules for businesses (Office québécois de la langue française) | https://www.oqlf.gouv.qc.ca/ |
| United States | Health information (HIPAA) | https://www.hhs.gov/hipaa/index.html |
| European Union | General Data Protection Regulation (GDPR) | https://eur-lex.europa.eu/eli/reg/2016/679/oj |

## 3. Compliance frameworks (later, not on day one)

| Framework | What it is | Link |
|---|---|---|
| SOC 2 | A report from an independent auditor on how you keep customer data safe | https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2 |
| ISO 27001 | An international standard for managing information security | https://www.iso.org/standard/27001 |

You do not need either for the first version. Good habits from the start make them much easier later: clear access rules, a record of every change, and good logs.

## Our answers for Nextia Clinic

- **Data:** health information, names, contact details, payments, so the stricter rules for health data apply.
- **Customers:** patients at seven locations in Quebec and Ontario (Montréal, Laval, Toronto, Mississauga, Ottawa, Kitchener, Oshawa).
- **Language:** because we serve patients in Quebec, the app works fully in French as well as English, and is built so more languages can be added.
- **Who may ask:** partners and insurers, so we build with SOC 2 habits from the start, without a SOC 2 report for now.
