import { useState, useMemo } from 'react';
import {
  Building2, Search, Plus, X, Upload, Download, FileText,
  CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronRight, Edit, Image,
} from 'lucide-react';
import { enterpriseTypes, businessScopeCategories, defaultMaterials } from '@/data/mockData';
import type { EnterpriseType, BusinessScopeItem, MaterialItem } from '@/types';

const steps = [
  { id: 1, name: '选择企业类型' },
  { id: 2, name: '匹配经营范围' },
  { id: 3, name: '生成材料清单' },
  { id: 4, name: '在线整理材料' },
];

const categoryList = ['科技服务', '商贸零售', '商务服务', '餐饮住宿', '文化教育', '建筑工程'];

export default function MaterialGuide() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<EnterpriseType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('科技服务');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<BusinessScopeItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredScopes = useMemo(() => {
    const all = Object.values(businessScopeCategories).flat();
    if (!searchKeyword.trim()) return businessScopeCategories[selectedCategory] || [];
    return all.filter((s) => s.name.includes(searchKeyword) || s.code.includes(searchKeyword));
  }, [selectedCategory, searchKeyword]);

  const handleSelectType = (type: EnterpriseType) => {
    setSelectedType(type);
    setMaterials(defaultMaterials[type] || []);
  };

  const toggleScope = (scope: BusinessScopeItem) => {
    const exists = selectedScopes.find((s) => s.code === scope.code);
    setSelectedScopes(exists ? selectedScopes.filter((s) => s.code !== scope.code) : [...selectedScopes, scope]);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const groupedMaterials = useMemo(() => {
    const groups: Record<string, MaterialItem[]> = {};
    materials.forEach((m) => { if (!groups[m.category]) groups[m.category] = []; groups[m.category].push(m); });
    return groups;
  }, [materials]);

  const progress = useMemo(() => {
    if (materials.length === 0) return 0;
    const verified = materials.filter((m) => m.status === 'verified').length;
    const uploaded = materials.filter((m) => m.status === 'uploaded').length;
    return Math.round(((verified + uploaded * 0.5) / materials.length) * 100);
  }, [materials]);

  const getStatusBadge = (status: MaterialItem['status']) => {
    if (status === 'verified') return <span className="badge-success"><CheckCircle2 size={12} />已上传</span>;
    if (status === 'uploaded') return <span className="badge-warning"><AlertCircle size={12} />待上传</span>;
    return <span className="badge-danger"><XCircle size={12} />缺失</span>;
  };

  const UploadBox = ({ title, hint, onClick }: { title: string; hint: string; onClick?: () => void }) => (
    <div onClick={onClick} className="border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center mx-auto mb-2">
        <Upload size={24} className="text-zinc-500" />
      </div>
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      <p className="text-xs text-zinc-400 mt-1">{hint}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">材料向导</h1>
        <p className="text-zinc-500 text-sm">按步骤完成企业开办所需材料准备</p>
      </div>

      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > step.id ? 'bg-success-600 text-white' :
                currentStep === step.id ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                'bg-zinc-200 text-zinc-500'
              }`}>
                {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
              </div>
              <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.name}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 flex-shrink-0 ${currentStep > step.id ? 'bg-primary-500' : 'bg-zinc-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 mb-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enterpriseTypes.map((type) => (
              <div key={type.id} onClick={() => handleSelectType(type.id)}
                className={`card-hover p-5 cursor-pointer border-2 transition-all ${
                  selectedType === type.id ? 'border-primary-500 ring-2 ring-primary-100' : 'border-transparent'
                }`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                    <Building2 size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900">{type.name}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">{type.description}</p>
                  </div>
                  {selectedType === type.id && <CheckCircle2 className="text-primary-600" size={20} />}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">适合人群</span><span className="text-zinc-700 font-medium text-right flex-1 ml-4">{type.suitableFor}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">股东人数</span><span className="text-zinc-700 font-medium">{type.shareholderCount}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">责任类型</span><span className="text-zinc-700 font-medium">{type.liability}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索经营范围关键词或行业代码" className="input pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryList.map((cat) => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setSearchKeyword(''); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat && !searchKeyword ? 'bg-primary-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}>{cat}</button>
              ))}
            </div>
            {selectedScopes.length > 0 && (
              <div className="card p-4">
                <div className="text-sm font-medium text-zinc-700 mb-2">已选经营范围 ({selectedScopes.length})</div>
                <div className="flex flex-wrap gap-2">
                  {selectedScopes.map((s) => (
                    <span key={s.code} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-sm border border-primary-200">
                      {s.name}
                      {s.isLicensed && <AlertCircle size={14} className="text-danger-600" />}
                      <button onClick={() => toggleScope(s)} className="hover:text-primary-900"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredScopes.map((scope) => {
                const selected = selectedScopes.find((s) => s.code === scope.code);
                return (
                  <div key={scope.code} onClick={() => toggleScope(scope)}
                    className={`card p-3 cursor-pointer border-2 transition-all ${selected ? 'border-primary-500 bg-primary-50/50' : 'border-transparent'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-900 text-sm">{scope.name}</span>
                          {scope.isLicensed && <span className="badge-danger"><AlertCircle size={12} />许可</span>}
                        </div>
                        <span className="text-xs text-zinc-400">{scope.code}</span>
                        {scope.isLicensed && scope.licenseRequired && <div className="text-xs text-danger-600 mt-1">需办理：{scope.licenseRequired}</div>}
                      </div>
                      {selected ? <CheckCircle2 size={18} className="text-primary-600 mt-0.5" /> : <Plus size={18} className="text-zinc-400 mt-0.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700">总体进度</span>
                <span className="text-sm font-bold text-primary-600">{progress}%</span>
              </div>
              <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>
            {Object.entries(groupedMaterials).map(([category, items]) => {
              const expanded = expandedCategories.includes(category);
              return (
                <div key={category} className="card overflow-hidden">
                  <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-2">
                      {expanded ? <ChevronDown size={18} className="text-zinc-500" /> : <ChevronRight size={18} className="text-zinc-500" />}
                      <span className="font-medium text-zinc-900">{category}</span>
                      <span className="badge-info">{items.length}项</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-zinc-100 divide-y divide-zinc-100">
                      {items.map((m) => (
                        <div key={m.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <FileText size={18} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-zinc-900 text-sm">{m.name}</span>
                                  {m.required && <span className="badge-danger">必填</span>}
                                  {getStatusBadge(m.status)}
                                </div>
                                {m.remark && <p className="text-xs text-zinc-500 mt-1">{m.remark}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button className="btn-outline !px-3 !py-1.5 text-xs"><Upload size={14} />上传</button>
                              {m.templateAvailable && <button className="btn-secondary !px-3 !py-1.5 text-xs"><Download size={14} />模板</button>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2"><Image size={18} className="text-primary-600" />身份证明上传</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadBox title="身份证正面" hint="点击或拖拽上传人像面" />
                <UploadBox title="身份证反面" hint="点击或拖拽上传国徽面" />
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-primary-600" />租赁材料上传</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadBox title="房屋产权证明" hint="房产证或不动产权证" />
                <UploadBox title="租赁合同" hint="房屋租赁协议复印件" />
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2"><Edit size={18} className="text-primary-600" />公司章程模板在线编辑</h3>
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600"><FileText size={20} /></div>
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">有限责任公司章程模板</p>
                    <p className="text-xs text-zinc-500">DOCX · 约需 5-10 分钟填写</p>
                  </div>
                </div>
                <button className="btn-primary"><Edit size={16} />在线编辑</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)} disabled={currentStep === 1} className="btn-secondary">上一步</button>
        <button onClick={() => currentStep < 4 && setCurrentStep(currentStep + 1)}
          disabled={currentStep === 4 || (currentStep === 1 && !selectedType)} className="btn-primary">
          {currentStep === 4 ? '完成' : '下一步'}
        </button>
      </div>
    </div>
  );
}
