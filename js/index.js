var app = new Vue({
	el: '#app',
	data() {
		return {
			allData: [],
			err: '',
			dateData: [],
			dateSelect: '',
			filterData: [],
			tagCheck: false,
		};
	},
	created() {
		var url = './file/learn10.xlsx';
		axios
			.get(url, { responseType: 'arraybuffer' })
			.then((res) => {
				let xlsx_data = new Uint8Array(res.data);
				let excelData = XLSX.read(xlsx_data, { type: 'array', cellText: false, cellDates: true });
				let jsonData = Object.keys(excelData.Sheets).map((name) => ({
					name,
					data: XLSX.utils.sheet_to_json(excelData.Sheets[name], { header: 0, raw: false, dateNF: 'm/d' }),
				}));
				let resData = jsonData[0].data;
				this.allData = resData;
				resData.filter((item) => {
					if (item.classDate !== undefined) {
						this.dateData.push(item.classDate);
					}
				});
			})
			.catch((err) => {
				this.err = err;
			});
	},
	computed: {
		growingSort() {
			let setData;
			setData = this.filterData
				.filter((item) => {
					return item.className === 'growing';
				})
				.sort((a, b) => {
					let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
						bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
					return aNum - bNum;
				});
			return setData;
		},
		sharingSort() {
			let setData, OnLine, Local;
			setData = this.filterData.filter((item) => {
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
		filterDate() {
			let theDate = this.dateData.filter((item, idx, arr) => {
				return arr.indexOf(item) === idx;
			});
			let sortData = theDate.sort((a, b) => {
				return new Date(a) - new Date(b);
			});
			return sortData;
		},
	},
	methods: {
		getTinyUrl(url) {
			let apiUrl = `https://api.shrtco.de/v2/shorten?url=${url}`;
			// console.log('apiUrl:', apiUrl , typeof apiUrl);
			axios
				.get(apiUrl)
				.then((res) => {
					// console.log('res.data.result.full_short_link2:', res.data.result.full_short_link2);
					return res.data.result.full_short_link2;
				})
				.catch((err) => {
					return url;
					// return url;
				});
		},
	},
	// filters: {
	//   convertToChineseDay: function (day) {
	//     const theDay = new Date(day);
	//     const getDay = theDay.getDay();
	//     const chineseDay = ["日", "一", "二", "三", "四", "五", "六"];
	//     if (isNaN(getDay)) {
	//       return day;
	//     }
	//     return `(${chineseDay[getDay]})`;
	//   },
	// },
	watch: {
		dateSelect(newValue, oldValue) {
			// console.log('newValue, oldValue:', newValue, oldValue);
			let data = this.allData.filter((item) => {
				// console.log('item:', item);
				return item.classDate === this.dateSelect;
			});
			this.filterData = data;
		},
	},
});
