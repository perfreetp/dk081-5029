import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Users,
  MapPin,
  Briefcase,
  CheckSquare,
  FileCheck,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Landmark,
  Shield,
  Banknote,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Shareholder, BusinessScopeItem, ProcessStage, BusinessPremises } from '@/types';

const steps = [
  { key: 0, icon: Building2, label: '企业名称' },
  { key: 1, icon: User, label: '人员信息' },
  { key: 2, icon: MapPin, label: '经营场所' },
  { key: 3, icon: Briefcase, label: '经营范围' },
  { key: 4, icon: CheckSquare, label: '并联事项' },
  { key: 5, icon: FileCheck, label: '确认提交' },
];

const parallelServices: { key: ProcessStage; label: string; icon: typeof CreditCard }[] = [
  { key: 'business_license', label: '营业执照', icon: CreditCard },
  { key: 'seal_engraving', label: '刻章备案', icon: Shield },
  { key: 'tax_registration', label: '税务登记', icon: Banknote },
  { key: 'social_insurance', label: '社保开户', icon: Users },
  { key: 'housing_fund', label: '公积金开户', icon: Landmark },
  { key: 'bank_appointment', label: '银行预约', icon: Building2 },
];

export default function Application() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const app = useAppStore((s) => s.currentApplication);
  const submitApplication = useAppStore((s) => s.submitApplication);
  const addMessage = useAppStore((s) => s.addMessage);

  const [altNames, setAltNames] = useState<string[]>(app?.alternativeNames || ['']);
  const [capital, setCapital] = useState(app?.registeredCapital || 100);
  const [term, setTerm] = useState(app?.businessTerm || '长期');

  const [legalName, setLegalName] = useState(app?.legalRepresentative.name || '');
  const [legalId, setLegalId] = useState(app?.legalRepresentative.idNumber || '');
  const [legalPhone, setLegalPhone] = useState(app?.legalRepresentative.phone || '');

  const [shareholders, setShareholders] = useState<Shareholder[]>(app?.shareholders || []);
  const addShareholder = () => {
    setShareholders([
      ...shareholders,
      { id: `s${Date.now()}`, name: '', idType: '居民身份证', idNumber: '', phone: '', email: '', role: 'shareholder', shareRatio: 0, subscribedCapital: 0 },
    ]);
  };
  const removeShareholder = (id: string) => setShareholders(shareholders.filter((s) => s.id !== id));

  const [supervisorName, setSupervisorName] = useState(app?.supervisors[0]?.name || '');

  const [province, setProvince] = useState(app?.premises.province || '');
  const [city, setCity] = useState(app?.premises.city || '');
  const [district, setDistrict] = useState(app?.premises.district || '');
  const [address, setAddress] = useState(app?.premises.address || '');
  const [propertyType, setPropertyType] = useState(app?.premises.propertyType || 'rented');

  const [scopeList, setScopeList] = useState<BusinessScopeItem[]>(app?.businessScope || []);
  const removeScope = (code: string) => setScopeList(scopeList.filter((s) => s.code !== code));

  const [selectedServices, setSelectedServices] = useState<ProcessStage[]>(
    app?.selectedServices || parallelServices.map((s) => s.key)
  );
  const toggleService = (key: ProcessStage) => {
    setSelectedServices(selectedServices.includes(key) ? selectedServices.filter((s) => s !== key) : [...selectedServices, key]);
  };

  const [signed, setSigned] = useState(false);

  const prev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const next = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);

  const handleSubmit = () => {
    if (!app || !signed) return;
    submitApplication(app.id);
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    addMessage({
      id: `msg_${Date.now()}`,
      type: 'process',
      title: `${app.enterpriseName} 申请已提交`,
      content: `您的企业开办申请已成功提交！各部门将并联受理，预计1-3个工作日完成营业执照办理。您可在进度中心查看各环节办理状态。`,
      isRead: false,
      createTime: now,
      relatedApplicationId: app.id,
    });
    addMessage({
      id: `msg_${Date.now() + 1}`,
      type: 'reminder',
      title: '请及时补充完善材料',
      content: '为确保审核顺利通过，请前往材料向导上传住所使用证明、《企业名称自主申报告知书》等材料，完整的材料有助于加快审核速度。',
      isRead: false,
      createTime: now,
      relatedApplicationId: app.id,
    });
    navigate('/progress');
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-64 shrink-0 card p-6">
        <h3 className="text-lg font-semibold mb-6">办理步骤</h3>
        <div className="relative space-y-6">
          {steps.map((step, idx) => (
            <div key={step.key} className="relative flex items-start gap-3">
              {idx < steps.length - 1 && (
                <div className={idx < currentStep ? 'step-line-active' : 'step-line'} />
              )}
              <div
                className={
                  idx < currentStep
                    ? 'step-dot-completed'
                    : idx === currentStep
                    ? 'step-dot-active'
                    : 'step-dot-pending'
                }
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <div className="pt-1.5">
                <p className={`text-sm font-medium ${idx <= currentStep ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 card p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">{steps[currentStep].label}</h2>

          {currentStep === 0 && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <label className="label">企业名称（自主申报回填）</label>
                <input className="input" defaultValue={app?.enterpriseName} readOnly />
              </div>
              <div>
                <label className="label">备选名称</label>
                {altNames.map((n, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input" value={n} onChange={(e) => {
                      const arr = [...altNames]; arr[i] = e.target.value; setAltNames(arr);
                    }} placeholder={`备选名称 ${i + 1}`} />
                    {i > 0 && <button className="btn-danger px-3" onClick={() => setAltNames(altNames.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
                <button className="btn-outline text-sm" onClick={() => setAltNames([...altNames, ''])}><Plus className="w-4 h-4" />添加备选</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">注册资本（万元）</label><input type="number" className="input" value={capital} onChange={(e) => setCapital(Number(e.target.value))} /></div>
                <div><label className="label">营业期限</label><select className="input" value={term} onChange={(e) => setTerm(e.target.value)}><option value="长期">长期</option><option value="10年">10年</option><option value="20年">20年</option><option value="30年">30年</option></select></div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                <h4 className="font-medium mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary-600" />法定代表人</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">姓名</label><input className="input" value={legalName} onChange={(e) => setLegalName(e.target.value)} /></div>
                  <div><label className="label">身份证号</label><input className="input" value={legalId} onChange={(e) => setLegalId(e.target.value)} /></div>
                  <div className="col-span-2"><label className="label">手机号码</label><input className="input" value={legalPhone} onChange={(e) => setLegalPhone(e.target.value)} /></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2"><Users className="w-4 h-4 text-primary-600" />股东信息</h4>
                  <button className="btn-outline text-sm" onClick={addShareholder}><Plus className="w-4 h-4" />添加股东</button>
                </div>
                {shareholders.map((s, i) => (
                  <div key={s.id} className="p-4 rounded-lg border border-zinc-200 mb-3">
                    <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium">股东 {i + 1}</span><button className="btn-danger text-sm px-2 py-1" onClick={() => removeShareholder(s.id)}><Trash2 className="w-4 h-4" /></button></div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input" placeholder="姓名" value={s.name} onChange={(e) => setShareholders(shareholders.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x))} />
                      <input className="input" placeholder="身份证号" value={s.idNumber} onChange={(e) => setShareholders(shareholders.map((x) => x.id === s.id ? { ...x, idNumber: e.target.value } : x))} />
                      <input className="input" placeholder="出资比例(%)" type="number" value={s.shareRatio} onChange={(e) => setShareholders(shareholders.map((x) => x.id === s.id ? { ...x, shareRatio: Number(e.target.value) } : x))} />
                      <input className="input" placeholder="认缴出资额(万)" type="number" value={s.subscribedCapital} onChange={(e) => setShareholders(shareholders.map((x) => x.id === s.id ? { ...x, subscribedCapital: Number(e.target.value) } : x))} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                <h4 className="font-medium mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600" />监事信息</h4>
                <div><label className="label">监事姓名</label><input className="input" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} /></div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="label">省份</label><input className="input" value={province} onChange={(e) => setProvince(e.target.value)} /></div>
                <div><label className="label">城市</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></div>
                <div><label className="label">区/县</label><input className="input" value={district} onChange={(e) => setDistrict(e.target.value)} /></div>
              </div>
              <div><label className="label">详细地址</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div><label className="label">产权类型</label><div className="flex gap-3">
                {[['owned', '自有'], ['rented', '租赁'], ['provided', '无偿提供']].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-zinc-50">
                    <input type="radio" checked={propertyType === v} onChange={() => setPropertyType(v as BusinessPremises['propertyType'])} />
                    <span className="text-sm">{l}</span>
                  </label>
                ))}
              </div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">产权证明类型</label><input className="input" placeholder="不动产权证书" /></div>
                <div><label className="label">产权证明编号</label><input className="input" placeholder="京（202x）朝不动产权第xxxxxx号" /></div>
              </div>
              {propertyType === 'rented' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">租赁起始日</label><input type="date" className="input" /></div>
                  <div><label className="label">租赁到期日</label><input type="date" className="input" /></div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">已选经营范围</h4>
                <button className="btn-outline text-sm"><Plus className="w-4 h-4" />添加经营范围</button>
              </div>
              {scopeList.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 border border-dashed rounded-lg">暂无经营范围，请点击上方按钮添加</div>
              ) : (
                <div className="space-y-2">
                  {scopeList.map((item) => (
                    <div key={item.code} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-500">{item.code}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                        {item.isLicensed && <span className="badge-warning">需许可</span>}
                      </div>
                      <button className="btn-danger px-2 py-1" onClick={() => removeScope(item.code)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <p className="text-sm text-zinc-500 mb-4">请选择需要一并办理的事项，系统将自动并联办理</p>
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {parallelServices.map((svc) => {
                  const checked = selectedServices.includes(svc.key);
                  return (
                    <label key={svc.key} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${checked ? 'border-primary-500 bg-primary-50' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleService(svc.key)} className="w-4 h-4" />
                      <svc.icon className={`w-5 h-5 ${checked ? 'text-primary-600' : 'text-zinc-400'}`} />
                      <span className={`text-sm font-medium ${checked ? 'text-primary-700' : ''}`}>{svc.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5 max-w-3xl">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-zinc-500">企业名称：</span>{app?.enterpriseName}</div>
                  <div><span className="text-zinc-500">注册资本：</span>{capital} 万元</div>
                  <div><span className="text-zinc-500">法定代表人：</span>{legalName || '-'}</div>
                  <div><span className="text-zinc-500">营业期限：</span>{term}</div>
                  <div className="col-span-2"><span className="text-zinc-500">经营场所：</span>{province}{city}{district}{address}</div>
                  <div className="col-span-2"><span className="text-zinc-500">股东：</span>{shareholders.map((s) => s.name).filter(Boolean).join('、') || '-'}</div>
                  <div className="col-span-2"><span className="text-zinc-500">并联事项：</span>{parallelServices.filter((s) => selectedServices.includes(s.key)).map((s) => s.label).join('、')}</div>
                </div>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-zinc-50">
                <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} className="mt-0.5 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">电子签名确认</p>
                  <p className="text-sm text-zinc-500 mt-1">本人确认上述信息真实有效，已完成所有签字人员的电子签名认证</p>
                </div>
              </label>
              <button className="btn-primary w-full py-3 text-base" disabled={!signed} onClick={handleSubmit}><FileCheck className="w-5 h-5" />一键提交申请</button>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button className="btn-secondary" onClick={prev} disabled={currentStep === 0}><ArrowLeft className="w-4 h-4" />上一步</button>
          {currentStep < steps.length - 1 ? (
            <button className="btn-primary" onClick={next}>下一步<ArrowRight className="w-4 h-4" /></button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
