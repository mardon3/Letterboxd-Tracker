export namespace database {
	
	export class Movie {
	    letterboxd_id: string;
	    title: string;
	    year: number;
	    letterboxd_url: string;
	    rating: number;
	    letterboxd_rating: number;
	    length: number;
	    // Go type: time
	    date_added: any;
	    poster_url: string;
	    director: string;
	    cast: string;
	    writers: string;
	
	    static createFrom(source: any = {}) {
	        return new Movie(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.letterboxd_id = source["letterboxd_id"];
	        this.title = source["title"];
	        this.year = source["year"];
	        this.letterboxd_url = source["letterboxd_url"];
	        this.rating = source["rating"];
	        this.letterboxd_rating = source["letterboxd_rating"];
	        this.length = source["length"];
	        this.date_added = this.convertValues(source["date_added"], null);
	        this.poster_url = source["poster_url"];
	        this.director = source["director"];
	        this.cast = source["cast"];
	        this.writers = source["writers"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

