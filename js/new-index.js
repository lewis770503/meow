var app = new Vue({
	el: '#app',
	data() {
		return {
			allData: [],
			dateData: [],
			dateSelect: '',
			filterData: [],
			tagCheck: false,
			err: {
				learnErr: '',
				dateErr: '',
			},
		};
	},
	created() {
		const dateFile = './file/date.xlsx',
			learnFile = './file/newLearn.xlsx';
		axios
			.get(learnFile, { responseType: 'arraybuffer' })
			.then((res) => {
				let xlsx_data = new Uint8Array(res.data);
				let excelData = XLSX.read(xlsx_data, { type: 'array', cellText: false, cellDates: true });
				let jsonData = Object.keys(excelData.Sheets).map((name) => ({
					name,
					data: XLSX.utils.sheet_to_json(excelData.Sheets[name], { header: 0, raw: false, dateNF: 'm/d' }),
				}));
				let resData = jsonData[0].data;
				this.allData = resData;
			})
			.catch((err) => {
				this.err.learnErr = err;
			});
		axios
			.get(dateFile, { responseType: 'arraybuffer' })
			.then((res) => {
				let xlsx_data = new Uint8Array(res.data);
				let excelData = XLSX.read(xlsx_data, { type: 'array', cellText: false, cellDates: true });
				let jsonData = Object.keys(excelData.Sheets).map((name) => ({
					name,
					data: XLSX.utils.sheet_to_json(excelData.Sheets[name], { header: 0, raw: false, dateNF: 'm/d' }),
				}));
				let resData = jsonData[0].data;
				this.dateData = resData;
			})
			.catch((err) => {
				this.err.learnErr = err;
			});
	},
	computed: {
		monthClass() {
			let setData;
			setData = this.allData.filter((item) => {
				return item.Lesson === '每月固定課程';
			});
			return setData;
		},
		everyDay() {
			let growingData, localData, onlineData;
			growingData = this.allData.filter((item) => {
				return item.className === 'growing' && item.classDay === '每天';
			});
			localData = this.allData.filter((item) => {
				return item.className === 'sharing' && item.classType === '實體現場' && item.classDay === '每天';
			});
			onlineData = this.allData.filter((item) => {
				return item.className === 'sharing' && item.classType === '線上直播' && item.classDay === '每天';
			});
			return { growing: growingData, local: localData, online: onlineData };
		},
		weekClass() {
			let setData;
			setData = this.allData.filter((item) => {
				return item.className === 'growing' && item.Lesson === '每周固定課程';
			});
			localData = this.allData.filter((item) => {
				return item.className === 'sharing' && item.classType === '實體現場' && item.Lesson === '每周固定課程';
			});
			onlineData = this.allData.filter((item) => {
				return item.className === 'sharing' && item.classType === '線上直播' && item.Lesson === '每周固定課程';
			});
			return { growing: setData, local: localData, online: onlineData };
		},
		growingFilter() {
			let setData;
			setData = this.allData.filter((item) => {
				return item.className === 'growing' && item.Lesson !== '每月固定課程' && item.classDay !== '每天';
			});
			return setData;
		},
		growingClass() {
			let growingNewData = [],
				nowDate = '';
			for (let i = 0; i < this.dateData.length; i++) {
				let _classDay = this.dateData[i].dfDay,
					_classDate = this.dateData[i].dfDate;
				for (let j = 0; j < this.everyDay.growing.length; j++) {
					let _everyDay;
					_everyDay = Object.assign({}, this.everyDay.growing[j]);
					_everyDay.classDate = _classDate;
					_everyDay.classDay = _classDay;
					growingNewData = growingNewData.concat(_everyDay);
				}
				growingNewData = growingNewData.concat(this.growingFilter[i]);
			}

			for (let i = 0; i < this.dateData.length; i++) {
				let _classDay = this.dateData[i].dfDay,
					_classDate = this.dateData[i].dfDate;
				for (let k = 0; k < this.weekClass.growing.length; k++) {
					let _growingDate = new Date(this.dateData[i].classDate),
						_weekDate = new Date(this.weekClass.growing[k].classDate);
					if (_classDay.indexOf(this.weekClass.growing[k].classDay) >= 0) {
						console.log(this.weekClass.growing[k]);
					}

					// if (_classDay.indexOf(this.weekClass.growing[k].classDay) >= 0 && this.growingNewData[i].Title !== this.weekClass[k].Title) {
					// let _weekDay;
					// _weekDay = Object.assign({}, this.weekDay.growing[k]);
					// _weekDay.classDate = _classDate;
					// _weekDay.classDay = _classDay;
					growingNewData = growingNewData.concat(this.weekClass.growing[k]);
					// }
				}
			}
			growingNewData
				.sort((a, b) => {
					let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
						bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
					return aNum - bNum;
				})
				.sort((a, b) => {
					return new Date(a.classDate) - new Date(b.classDate);
				});
			return growingNewData;
		},
		sharingSort() {
			let setData, OnLine, Local;
			setData = this.allData.filter((item) => {
				return item.className === 'sharing';
			});
			OnLine = setData
				.filter((item) => {
					return item.classType === '線上直播';
				})
				.sort((a, b) => {
					let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
						bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
					return aNum - bNum;
				});
			Local = setData
				.filter((item) => {
					return item.classType === '實體現場';
				})
				.sort((a, b) => {
					let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
						bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
					return aNum - bNum;
				})
				.sort((a, b) => {
					let aNum = a.Address.substr(0, 2),
						bNum = b.Address.substr(0, 2);
					// console.log('address', aNum, bNum);
					return aNum - bNum;
				});
			return { onlineData: OnLine, localData: Local };
		},
		onlineClass() {
			let onlineNewData = [],
				nowDate = '';
			for (let i = 0; i < this.sharingSort.onlineData.length; i++) {
				let _classDay = this.sharingSort.onlineData[i].classDay,
					_classDate = this.sharingSort.onlineData[i].classDate;
				for (let k = 0; k < this.monthClass.length; k++) {
					if (_classDay.indexOf(this.monthClass[k].dfDay) >= 0 && this.sharingSort.onlineData[i].Title !== this.monthClass[k].Title) {
						onlineNewData = onlineNewData.concat(this.monthClass[k]);
					}
				}
				if (nowDate !== _classDate) {
					for (let j = 0; j < this.everyDay.online.length; j++) {
						let _everyDay;
						_everyDay = Object.assign({}, this.everyDay.online[j]);
						_everyDay.classDate = _classDate;
						_everyDay.classDay = _classDay;
						onlineNewData = onlineNewData.concat(_everyDay);
					}
					nowDate = _classDate;
				}
				onlineNewData = onlineNewData.concat(this.growingFilter[i]);
			}
			onlineNewData
				.sort((a, b) => {
					let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
						bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
					return aNum - bNum;
				})
				.sort((a, b) => {
					return new Date(a.classDate) - new Date(b.classDate);
				});
			return onlineNewData;
		},
	},
	methods: {},

	watch: {},
});
