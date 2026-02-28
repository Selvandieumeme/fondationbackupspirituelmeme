# ACTIVATION-DAY CHECKLIST – FOBAS VPS2 & VPS3

## VPS2 – API Server
- [ ] Verify network connectivity ak VPS1
- [ ] Configure firewall (port 3000, SSH)
- [ ] Deploy app code via Terraform/Ansible (dev-infra branch)
- [ ] Start Node.js API server
- [ ] Verify endpoints: `http://VPS2_IP:3000/health`
- [ ] Register VPS2 nan load balancer (fobas_lb.conf)

## VPS3 – Workers / Background Jobs
- [ ] Verify network connectivity ak VPS1
- [ ] Configure firewall (port 4000, SSH)
- [ ] Deploy workers code via Terraform/Ansible
- [ ] Start worker services (Redis/BullMQ)
- [ ] Verify job queue connectivity
- [ ] Register VPS3 nan load balancer (fobas_lb.conf)

## Final Verification
- [ ] Test full workflow: users → API → Workers → DB
- [ ] Ensure no data loss ni downtime
- [ ] Log test results
- [ ] Confirm system ready pou 10k → 1M users

> ⚠️ **Nòt:** Tout VPS yo rete izole jiskaske ou fè tout verifykasyon. Pa manyen VPS1 oswa baz done aktyèl la.
